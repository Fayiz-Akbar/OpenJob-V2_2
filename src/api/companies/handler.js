class CompaniesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postCompanyHandler = this.postCompanyHandler.bind(this);
    this.getCompaniesHandler = this.getCompaniesHandler.bind(this);
    this.getCompanyByIdHandler = this.getCompanyByIdHandler.bind(this);
    this.putCompanyByIdHandler = this.putCompanyByIdHandler.bind(this);
    this.deleteCompanyByIdHandler = this.deleteCompanyByIdHandler.bind(this);
  }

  async postCompanyHandler(req, res, next) {
    try {
      this._validator.validateCompanyPayload(req.body);
      const { name, location, description } = req.body;
      
      // Ambil ID user dari payload token (lewat middleware auth)
      const ownerId = req.user.id; 

      // Kirim ownerId ke service
      const companyId = await this._service.addCompany({ name, location, description, ownerId });

      res.status(201).json({
        status: 'success',
        data: {
          companyId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompaniesHandler(req, res, next) {
    try {
      const companies = await this._service.getCompanies();
      res.status(200).json({
        status: 'success',
        data: { companies },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const { source, company } = await this._service.getCompanyById(id);

      if (source === 'cache') {
        res.header('X-Data-Source', 'cache');
      }

      res.status(200).json({
        status: 'success',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  async putCompanyByIdHandler(req, res, next) {
    try {
      this._validator.validateCompanyPayload(req.body);
      const { id } = req.params;

      await this._service.editCompanyById(id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Company berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCompanyByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteCompanyById(id);

      res.status(200).json({
        status: 'success',
        message: 'Company berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompaniesHandler;