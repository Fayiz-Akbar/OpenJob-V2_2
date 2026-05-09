class JobsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postJobHandler = this.postJobHandler.bind(this);
    this.getJobsHandler = this.getJobsHandler.bind(this);
    this.getJobByIdHandler = this.getJobByIdHandler.bind(this);
    this.getJobsByCompanyIdHandler = this.getJobsByCompanyIdHandler.bind(this);
    this.getJobsByCategoryIdHandler = this.getJobsByCategoryIdHandler.bind(this);
    this.putJobByIdHandler = this.putJobByIdHandler.bind(this);
    this.deleteJobByIdHandler = this.deleteJobByIdHandler.bind(this);
  }

  async postJobHandler(req, res, next) {
    try {
      this._validator.validateJobPayload(req.body);
      const jobId = await this._service.addJob(req.body);

      res.status(201).json({
        status: 'success',
        data: { id: jobId },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsHandler(req, res, next) {
    try {
      const { title, 'company-name': companyName } = req.query;
      
      const jobs = await this._service.getJobs(title, companyName);
      res.status(200).json({
        status: 'success',
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const job = await this._service.getJobById(id);
      res.status(200).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsByCompanyIdHandler(req, res, next) {
    try {
      const { companyId } = req.params;
      const jobs = await this._service.getJobsByCompanyId(companyId);
      res.status(200).json({
        status: 'success',
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsByCategoryIdHandler(req, res, next) {
    try {
      const { categoryId } = req.params;
      const jobs = await this._service.getJobsByCategoryId(categoryId);
      res.status(200).json({
        status: 'success',
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  }

  async putJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.editJobById(id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Job berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteJobById(id);

      res.status(200).json({
        status: 'success',
        message: 'Job berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobsHandler;