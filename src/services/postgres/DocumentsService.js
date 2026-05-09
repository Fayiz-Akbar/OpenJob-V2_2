const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class DocumentsService {
  constructor() {
    this._pool = new Pool();
  }

  async addDocument({ filename, originalName, size }) {
    const id = `document-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO documents VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, filename, originalName, size, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Dokumen gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getDocuments() {
    const result = await this._pool.query('SELECT * FROM documents');
    return result.rows;
  }

  async getDocumentById(id) {
    const query = {
      text: 'SELECT * FROM documents WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Dokumen tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteDocumentById(id) {
    const query = {
      text: 'DELETE FROM documents WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Dokumen tidak ditemukan');
    }
  }
}

module.exports = DocumentsService;