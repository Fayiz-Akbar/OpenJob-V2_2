const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class BookmarksService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addBookmark(userId, jobId) {
    const id = `bookmark-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO bookmarks VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, userId, jobId, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Bookmark gagal ditambahkan');
    }

    await this._cacheService.delete(`bookmarks:${userId}`);

    return result.rows[0].id;
  }

  async getBookmarksByUserId(userId) {
    try {
      const result = await this._cacheService.get(`bookmarks:${userId}`);
      return { source: 'cache', bookmarks: JSON.parse(result) };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM bookmarks WHERE user_id = $1',
        values: [userId],
      };
      const result = await this._pool.query(query);
      
      await this._cacheService.set(`bookmarks:${userId}`, JSON.stringify(result.rows));
      
      return { source: 'database', bookmarks: result.rows };
    }
  }

  async getBookmarkById(id) {
    const query = {
      text: 'SELECT * FROM bookmarks WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Bookmark tidak ditemukan');
    }
    return result.rows[0];
  }

  async deleteBookmarkById(id) {
    const query = {
      text: 'DELETE FROM bookmarks WHERE id = $1 RETURNING id, user_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Bookmark gagal dihapus. Id tidak ditemukan');
    }

    const { user_id } = result.rows[0];
    await this._cacheService.delete(`bookmarks:${user_id}`);
  }
}

module.exports = BookmarksService;