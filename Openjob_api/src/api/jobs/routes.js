const express = require('express');
const verifyToken = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', verifyToken, handler.postJobHandler);
  router.put('/:id', verifyToken, handler.putJobByIdHandler);
  router.delete('/:id', verifyToken, handler.deleteJobByIdHandler);

  router.get('/', handler.getJobsHandler);
  router.get('/:id', handler.getJobByIdHandler);
  router.get('/company/:companyId', handler.getJobsByCompanyIdHandler);
  router.get('/category/:categoryId', handler.getJobsByCategoryIdHandler);

  return router;
};

module.exports = routes;