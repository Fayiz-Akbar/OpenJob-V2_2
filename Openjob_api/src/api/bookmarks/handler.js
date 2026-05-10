class BookmarksHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postBookmarkHandler = this.postBookmarkHandler.bind(this);
    this.getBookmarksHandler = this.getBookmarksHandler.bind(this);
    this.getBookmarkByIdHandler = this.getBookmarkByIdHandler.bind(this);
    this.deleteBookmarkByIdHandler = this.deleteBookmarkByIdHandler.bind(this);
  }

  async postBookmarkHandler(req, res, next) {
    try {
      this._validator.validateBookmarkPayload(req.body);
      const { job_id } = req.body;
      const userId = req.user.id; // Dari middleware auth

      const bookmarkId = await this._service.addBookmark(userId, job_id);

      res.status(201).json({
        status: 'success',
        data: { id: bookmarkId },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarksHandler(req, res, next) {
    try {
      const userId = req.user.id;
      const { source, bookmarks } = await this._service.getBookmarksByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: { bookmarks },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarkByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const bookmark = await this._service.getBookmarkById(id);

      res.status(200).json({
        status: 'success',
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBookmarkByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteBookmarkById(id);

      res.status(200).json({
        status: 'success',
        message: 'Bookmark berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookmarksHandler;