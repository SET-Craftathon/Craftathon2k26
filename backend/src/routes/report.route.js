const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { createReport } = require('../controllers/report.controller');

// Import the new RAG controller
const reportRagController = require('../controllers/reportRag.controller');

// upload.array('image', 5) → handles multiple optional image files; field name must be 'image'
router.post('/report', upload.array('image', 5), createReport);

// --- NEW RAG ROUTES --- //
router.post('/embed-reports', reportRagController.embedReports);
router.post('/ask-reports', reportRagController.askReports);

module.exports = router;
