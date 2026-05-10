const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor(pool, cacheService) { 
    this._pool = pool;
    this._cacheService = cacheService; 
  }

  async addUser({ name, email, password, role = 'user' }) {
    await this.verifyNewEmail(email);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, name, email, hashedPassword, role, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan user. Email sudah digunakan.');
    }
  }

  // 👇 INI YANG BARU: Fungsi untuk mengambil data User (dengan Redis)
  async getUserById(id) {
    try {
      // Coba ambil data dari Redis Cache terlebih dahulu
      const result = await this._cacheService.get(`users:${id}`);
      return { user: JSON.parse(result), source: 'cache' };
    } catch (error) {
      // Jika tidak ada di cache (error di-throw oleh CacheService), ambil dari Postgres
      const query = {
        text: 'SELECT id, name, email, role FROM users WHERE id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);

      // Jika Id tidak valid / tidak ada
      if (!result.rowCount) {
        throw new NotFoundError('User tidak ditemukan');
      }

      const user = result.rows[0];

      // Simpan ke Cache selama 1 jam (3600 detik) sesuai syarat "Skilled"
      await this._cacheService.set(`users:${id}`, JSON.stringify(user), 3600);

      return { user, source: 'database' };
    }
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;