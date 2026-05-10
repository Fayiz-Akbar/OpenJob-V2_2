const express = require('express');
const verifyToken = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', verifyToken, handler.postCategoryHandler);
  router.put('/:id', verifyToken, handler.putCategoryByIdHandler);
  router.delete('/:id', verifyToken, handler.deleteCategoryByIdHandler);

  router.get('/', handler.getCategoriesHandler);
  router.get('/:id', handler.getCategoryByIdHandler);

  return router;
};

module.exports = routes;