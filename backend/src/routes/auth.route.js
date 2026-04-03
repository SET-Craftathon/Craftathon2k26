const express = require('express');
const router = express.Router();
const { adminLogin, verifyToken } = require('../controllers/auth.controller');
const { requireAdmin } = require('../middlewares/auth');

// Public - admin login
router.post('/login', adminLogin);

// Protected - verify token
router.get('/verify', requireAdmin, verifyToken);

module.exports = router;
