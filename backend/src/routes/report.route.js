const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { createReport } = require('../controllers/report.controller');

// upload.array('image', 5) → handles multiple optional image files; field name must be 'image'
router.post('/report', upload.array('image', 5), createReport);

module.exports = router;
