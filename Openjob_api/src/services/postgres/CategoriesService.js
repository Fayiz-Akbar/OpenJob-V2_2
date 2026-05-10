const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CategoriesService {
  constructor() {
    this._pool = new Pool();
  }

  async addCategory({ name }) {
    const id = `category-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO categories VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Category gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getCategories() {
    const result = await this._pool.query('SELECT id, name, created_at, updated_at FROM categories');
    return result.rows;
  }

  async getCategoryById(id) {
    const query = {
      text: 'SELECT * FROM categories WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Category tidak ditemukan');
    }

    return result.rows[0];
  }

  async editCategoryById(id, { name }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE categories SET name = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [name, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui category. Id tidak ditemukan');
    }
  }

  async deleteCategoryById(id) {
    const query = {
      text: 'DELETE FROM categories WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Category gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = CategoriesService;