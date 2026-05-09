class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.getCategoryByIdHandler = this.getCategoryByIdHandler.bind(this);
    this.putCategoryByIdHandler = this.putCategoryByIdHandler.bind(this);
    this.deleteCategoryByIdHandler = this.deleteCategoryByIdHandler.bind(this);
  }

  async postCategoryHandler(req, res, next) {
    try {
      this._validator.validateCategoryPayload(req.body);
      const categoryId = await this._service.addCategory(req.body);

      res.status(201).json({
        status: 'success',
        data: { id: categoryId },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesHandler(req, res, next) {
    try {
      const categories = await this._service.getCategories();
      res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const category = await this._service.getCategoryById(id);
      res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async putCategoryByIdHandler(req, res, next) {
    try {
      this._validator.validateCategoryPayload(req.body);
      const { id } = req.params;

      await this._service.editCategoryById(id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Category berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategoryByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteCategoryById(id);

      res.status(200).json({
        status: 'success',
        message: 'Category berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoriesHandler;