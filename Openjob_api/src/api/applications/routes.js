const express = require('express');
const verifyToken = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', verifyToken, handler.postApplicationHandler);
  router.get('/', verifyToken, handler.getApplicationsHandler);
  router.get('/:id', verifyToken, handler.getApplicationByIdHandler);
  router.get('/user/:userId', verifyToken, handler.getApplicationsByUserIdHandler);
  router.get('/job/:jobId', verifyToken, handler.getApplicationsByJobIdHandler);
  router.put('/:id', verifyToken, handler.putApplicationByIdHandler);
  router.delete('/:id', verifyToken, handler.deleteApplicationByIdHandler);

  return router;
};

module.exports = routes;