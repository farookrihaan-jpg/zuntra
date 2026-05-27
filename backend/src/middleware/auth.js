const jwt      = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User     = require('../models/User');

// Protect routes — require valid JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorised — no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.active) {
      res.status(401);
      throw new Error('User not found or deactivated');
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorised — invalid token');
  }
});

// Optional auth — attach user if token present, continue either way
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) {}
  }
  next();
});

// Restrict to specific roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not authorised for this route`);
  }
  next();
};
