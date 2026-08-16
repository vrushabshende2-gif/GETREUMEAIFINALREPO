const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first, then authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401);
    return next(new Error('Not authorized, token failed'));
  }
};

module.exports = { protect };
