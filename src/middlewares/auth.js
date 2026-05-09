const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return next(new AuthenticationError('Anda tidak berhak mengakses resource ini'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    
    req.user = decoded; 
    next(); 
  } catch (error) {
    return next(new AuthenticationError('Token tidak valid atau sudah kedaluwarsa'));
  }
};

module.exports = verifyToken;