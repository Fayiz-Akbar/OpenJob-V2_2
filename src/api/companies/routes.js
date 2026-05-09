const express = require('express');
const verifyToken = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', verifyToken, handler.postCompanyHandler);
  router.put('/:id', verifyToken, handler.putCompanyByIdHandler);
  router.delete('/:id', verifyToken, handler.deleteCompanyByIdHandler);

  router.get('/', handler.getCompaniesHandler);
  router.get('/:id', handler.getCompanyByIdHandler);

  return router;
};

module.exports = routes;