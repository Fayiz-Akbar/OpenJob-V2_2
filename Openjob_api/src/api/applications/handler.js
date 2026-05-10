const ProducerService = require('../../services/rabbitmq/ProducerService');

class ApplicationsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postApplicationHandler = this.postApplicationHandler.bind(this);
    this.getApplicationsHandler = this.getApplicationsHandler.bind(this);
    this.getApplicationByIdHandler = this.getApplicationByIdHandler.bind(this);
    this.getApplicationsByUserIdHandler = this.getApplicationsByUserIdHandler.bind(this);
    this.getApplicationsByJobIdHandler = this.getApplicationsByJobIdHandler.bind(this);
    this.putApplicationByIdHandler = this.putApplicationByIdHandler.bind(this);
    this.deleteApplicationByIdHandler = this.deleteApplicationByIdHandler.bind(this);
  }

  async postApplicationHandler(req, res, next) {
    try {
      this._validator.validatePostApplicationPayload(req.body);
      const { job_id: jobId } = req.body; 
      const userId = req.user.id; 

      const applicationId = await this._service.addApplication({ userId, jobId });

      await ProducerService.sendMessage('applications', JSON.stringify({ application_id: applicationId }));

      res.status(201).json({
        status: 'success',
        data: { 
          id: applicationId,
          user_id: userId,
          job_id: jobId,
          status: 'pending'
        }, 
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsHandler(req, res, next) {
    try {
      const applications = await this._service.getApplications();
      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationByIdHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { source, application } = await this._service.getApplicationById(id);

    res.header('X-Data-Source', source); //
    
    res.status(200).json({
      status: 'success',
      data: application, // - Jangan dibungkus { application }
    });
  } catch (error) {
    next(error);
  }
}

  async getApplicationsByUserIdHandler(req, res, next) {
    try {
      const { userId } = req.params;
      const { source, applications } = await this._service.getApplicationsByUserId(userId);

      res.header('X-Data-Source', source); // <--- TAMBAHKAN INI

      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsByJobIdHandler(req, res, next) {
    try {
      const { jobId } = req.params;
      const { source, applications } = await this._service.getApplicationsByJobId(jobId);

      res.header('X-Data-Source', source); // <--- TAMBAHKAN INI

      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  async putApplicationByIdHandler(req, res, next) {
    try {
      this._validator.validatePutApplicationPayload(req.body);
      const { id } = req.params;

      await this._service.editApplicationById(id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Application berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteApplicationByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteApplicationById(id);

      res.status(200).json({
        status: 'success',
        message: 'Application berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicationsHandler;