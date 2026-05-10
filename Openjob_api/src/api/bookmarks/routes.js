const express = require('express');
const verifyToken = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', verifyToken, handler.postBookmarkHandler);
  router.get('/', verifyToken, handler.getBookmarksHandler);
  router.get('/:id', verifyToken, handler.getBookmarkByIdHandler);
  router.delete('/:id', verifyToken, handler.deleteBookmarkByIdHandler);

  return router;
};

module.exports = routes;