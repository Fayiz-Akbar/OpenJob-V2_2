require('dotenv').config();
const amqp = require('amqplib');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const init = async () => {
  const pool = new Pool();

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const rabbitMqServer = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
  const connection = await amqp.connect(rabbitMqServer);
  const channel = await connection.createChannel();
  
  const queue = 'applications'; 
  await channel.assertQueue(queue, { durable: true });

  console.log(`[Consumer] Menunggu pesan di antrean '${queue}'...`);

  channel.consume(queue, async (message) => {
    try {
      if (message !== null) {
        const payload = JSON.parse(message.content.toString());
        const applicationId = payload.application_id; // Menggunakan snake_case sesuai payload

        console.log(`[Consumer] Menerima lamaran baru dengan ID: ${applicationId}`);

        const query = {
          text: `SELECT 
                   a.created_at, 
                   u_applicant.name AS applicant_name, 
                   u_applicant.email AS applicant_email, 
                   u_owner.email AS owner_email,
                   j.title AS job_title
                 FROM applications a
                 JOIN users u_applicant ON a.user_id = u_applicant.id
                 JOIN jobs j ON a.job_id = j.id
                 JOIN companies c ON j.company_id = c.id
                 JOIN users u_owner ON c.owner_id = u_owner.id
                 WHERE a.id = $1`,
          values: [applicationId],
        };

        const result = await pool.query(query);

        if (result.rowCount > 0) {
          const data = result.rows[0];

          const mailOptions = {
            from: '"OpenJob API" <no-reply@openjob.com>',
            to: data.owner_email,
            subject: `Lamaran Baru: ${data.job_title}`,
            text: `Halo,\n\nAda lamaran baru yang masuk ke pekerjaan Anda!\n\nDetail Pelamar:\n- Nama Pelamar: ${data.applicant_name}\n- Email Pelamar: ${data.applicant_email}\n- Tanggal Lamaran: ${data.created_at}\n\nTerima kasih.`,
          };

          await transporter.sendMail(mailOptions);
          console.log(`[Consumer] ✅ Email notifikasi berhasil dikirim ke ${data.owner_email}!`);
        }

        channel.ack(message);
      }
    } catch (error) {
      console.error('[Consumer] ❌ Gagal memproses pesan:', error.message);
    }
  });
};

init();