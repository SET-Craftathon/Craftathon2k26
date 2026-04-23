const express = require('express');
const router = express.Router();
const { getDashboardData, getAllReports, updateReportStatus, getReportById } = require('../controllers/dashboard.controller');
const { requireAdmin } = require('../middlewares/auth');

// All dashboard routes require admin auth
router.get('/', requireAdmin, getDashboardData);
router.get('/reports', requireAdmin, getAllReports);
router.get('/reports/:id', requireAdmin, getReportById);
router.put('/reports/:id/status', requireAdmin, updateReportStatus);

module.exports = router;
