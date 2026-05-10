const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ApplicationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addApplication({ userId, jobId }) {
    const jobCheck = await this._pool.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
    if (!jobCheck.rowCount) {
      throw new NotFoundError('Lowongan pekerjaan tidak ditemukan'); 
    }

    const duplicateCheck = await this._pool.query('SELECT id FROM applications WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
    if (duplicateCheck.rowCount > 0) {
      throw new InvariantError('Anda sudah melamar pekerjaan ini sebelumnya'); 
    }

    const id = `application-${nanoid(16)}`;
    const status = 'pending';
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO applications VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, userId, jobId, status, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Application gagal ditambahkan');
    }

    await this._cacheService.delete(`applications:user:${userId}`);
    await this._cacheService.delete(`applications:job:${jobId}`);

    return result.rows[0].id;
  }

  async getApplications() {
    const result = await this._pool.query('SELECT * FROM applications');
    return result.rows;
  }

  async getApplicationById(id) {
    try {
      const result = await this._cacheService.get(`application:${id}`);
      return { source: 'cache', application: JSON.parse(result) }; 
    } catch (error) {
      const query = {
        text: 'SELECT * FROM applications WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Application tidak ditemukan');
      }

      await this._cacheService.set(`application:${id}`, JSON.stringify(result.rows[0]));
      return { source: 'database', application: result.rows[0] };
    }
  }

  async getApplicationsByUserId(userId) {
    try {
      const result = await this._cacheService.get(`applications:user:${userId}`);
      return { source: 'cache', applications: JSON.parse(result) };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM applications WHERE user_id = $1',
        values: [userId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`applications:user:${userId}`, JSON.stringify(result.rows));
      return { source: 'database', applications: result.rows };
    }
  }

  async getApplicationsByJobId(jobId) {
    try {
      const result = await this._cacheService.get(`applications:job:${jobId}`);
      return { source: 'cache', applications: JSON.parse(result) };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM applications WHERE job_id = $1',
        values: [jobId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`applications:job:${jobId}`, JSON.stringify(result.rows));
      return { source: 'database', applications: result.rows };
    }
  }

  async editApplicationById(id, { status }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE applications SET status = $1, updated_at = $2 WHERE id = $3 RETURNING id, user_id, job_id',
      values: [status, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui application. Id tidak ditemukan');
    }

    const { user_id, job_id } = result.rows[0];
    await this._cacheService.delete(`application:${id}`);
    await this._cacheService.delete(`applications:user:${user_id}`);
    await this._cacheService.delete(`applications:job:${job_id}`);
  }

  async deleteApplicationById(id) {
    const query = {
      text: 'DELETE FROM applications WHERE id = $1 RETURNING id, user_id, job_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Application gagal dihapus. Id tidak ditemukan');
    }

    const { user_id, job_id } = result.rows[0];
    await this._cacheService.delete(`application:${id}`);
    await this._cacheService.delete(`applications:user:${user_id}`);
    await this._cacheService.delete(`applications:job:${job_id}`);
  }
}

module.exports = ApplicationsService;