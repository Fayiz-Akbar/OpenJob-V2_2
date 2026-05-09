const express = require('express');
const verifyToken = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.get('/', verifyToken, handler.getUserProfileHandler);
  router.get('/applications', verifyToken, handler.getUserApplicationsHandler);
  router.get('/bookmarks', verifyToken, handler.getUserBookmarksHandler);

  return router;
};

module.exports = routes;