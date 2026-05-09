const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class JobsService {
  constructor() {
    this._pool = new Pool();
  }

  async addJob(payload) {
    const id = `job-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const {
      company_id, category_id, title, description, job_type,
      experience_level, location_type, location_city,
      salary_min, salary_max, 
      is_salary_visible = false, 
      status = 'open',          
    } = payload;

    const query = {
      text: 'INSERT INTO jobs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id',
      values: [
        id, company_id, category_id, title, description, job_type,
        experience_level, location_type, location_city,
        salary_min, salary_max, is_salary_visible, status, createdAt, createdAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Job gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getJobs(title, companyName) {
    let queryText = `
      SELECT j.*, c.name AS company_name 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (title) {
      queryText += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title}%`);
      paramIndex++;
    }

    if (companyName) {
      queryText += ` AND c.name ILIKE $${paramIndex}`;
      values.push(`%${companyName}%`);
      paramIndex++;
    }

    const result = await this._pool.query({ text: queryText, values });
    return result.rows;
  }

  async getJobById(id) {
    const query = {
      text: 'SELECT * FROM jobs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Job tidak ditemukan');
    }
    return result.rows[0];
  }

  async getJobsByCompanyId(companyId) {
    const query = {
      text: 'SELECT * FROM jobs WHERE company_id = $1',
      values: [companyId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getJobsByCategoryId(categoryId) {
    const query = {
      text: 'SELECT * FROM jobs WHERE category_id = $1',
      values: [categoryId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async editJobById(id, payload) {
    const updatedAt = new Date().toISOString();
    const {
      title, description, salary_max
    } = payload;

    const query = {
      text: `UPDATE jobs SET 
             title = COALESCE($1, title), 
             description = COALESCE($2, description), 
             salary_max = COALESCE($3, salary_max), 
             updated_at = $4 
             WHERE id = $5 RETURNING id`,
      values: [title, description, salary_max, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui job. Id tidak ditemukan');
    }
  }

  async deleteJobById(id) {
    const query = {
      text: 'DELETE FROM jobs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Job gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = JobsService;