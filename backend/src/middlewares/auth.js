const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/admin');

/**
 * Middleware to verify admin JWT token.
 * Protects dashboard/admin-only routes.
 */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = { requireAdmin };
