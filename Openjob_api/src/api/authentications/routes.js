const express = require('express');

const routes = (handler) => {
  const router = express.Router();
  router.post('/', handler.postAuthenticationHandler);
  router.put('/', handler.putAuthenticationHandler);
  router.delete('/', handler.deleteAuthenticationHandler);
  return router;
};

module.exports = routes;