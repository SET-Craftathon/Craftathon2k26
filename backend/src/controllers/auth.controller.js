const jwt = require('jsonwebtoken');
const { ADMIN_CREDENTIALS, JWT_SECRET, JWT_EXPIRES_IN } = require('../config/admin');

/**
 * POST /api/admin/login
 * Validates hardcoded admin credentials and returns a JWT.
 */
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required.',
      });
    }

    // Check against hardcoded credentials
    if (
      username !== ADMIN_CREDENTIALS.username ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username,
        name: ADMIN_CREDENTIALS.name,
        role: 'admin',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: ADMIN_CREDENTIALS.id,
          username: ADMIN_CREDENTIALS.username,
          name: ADMIN_CREDENTIALS.name,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/admin/verify
 * Verifies the current admin token is still valid.
 */
const verifyToken = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      admin: req.admin,
    },
  });
};

module.exports = {
  adminLogin,
  verifyToken,
};
