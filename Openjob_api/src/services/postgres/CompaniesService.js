const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CompaniesService {
  constructor(pool, cacheService) {
    this._pool = pool; 
    this._cacheService = cacheService;
  }

  async addCompany({ name, location, description, ownerId }) {
    const id = `company-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO companies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, ownerId, name, location, description, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Company gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getCompanies() {
  const result = await this._pool.query('SELECT id, name, location FROM companies');
  return result.rows;
}

  async getCompanyById(id) {
    try {
      const result = await this._cacheService.get(`company:${id}`);
      
      if (result !== null) { 
          return { source: 'cache', company: JSON.parse(result) };
      }
      
      throw new Error('Cache miss');
    } catch (error) {
      const query = {
        // TIPS: Postman terkadang mengekspektasikan format camelCase (createdAt, updatedAt)
        // Kita alias-kan langsung di query SQL agar lebih aman
        text: 'SELECT id, name, location, description, created_at AS "createdAt", updated_at AS "updatedAt" FROM companies WHERE id = $1',
        values: [id],
      };
      
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Company tidak ditemukan');
      }

      const company = result.rows[0];

      await this._cacheService.set(`company:${id}`, JSON.stringify(company), 3600);

      return { source: 'database', company };
    }
  }

  async editCompanyById(id, { name, location, description }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE companies SET name = $1, location = $2, description = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, location, description, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui company. Id tidak ditemukan');
    }

    await this._cacheService.delete(`company:${id}`);
  }

  async deleteCompanyById(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Company gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`company:${id}`);
  }
}

module.exports = CompaniesService;