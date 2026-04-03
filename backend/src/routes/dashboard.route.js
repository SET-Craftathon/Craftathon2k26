const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard.controller');
const { requireAdmin } = require('../middlewares/auth');

// All dashboard routes require admin auth
router.get('/', requireAdmin, getDashboardData);

module.exports = router;
