const express = require('express');

const routes = (handler) => {
  const router = express.Router();
  router.post('/', handler.postUserHandler);
  router.get('/:id', handler.getUserByIdHandler);
  return router;
};

module.exports = routes;