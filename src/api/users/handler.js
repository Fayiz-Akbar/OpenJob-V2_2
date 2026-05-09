class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(req, res, next) {
    try {
      this._validator.validateUserPayload(req.body);
      const userId = await this._service.addUser(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          id: userId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const { source, user } = await this._service.getUserById(id);

      if (source === 'cache') {
        res.header('X-Data-Source', 'cache');
      }

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersHandler;