const express = require('express');
const router = express.Router();
const { upload, analyzeResume } = require('../controllers/atsController');

const rateLimit = require('express-rate-limit');

// Restrict heavy memory usage from concurrent uploads
const atsUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, // Max 10 scans per hour
  message: 'Too many resume scans from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/ats/analyze — accepts multipart/form-data with field "resume"
router.post('/analyze', atsUploadLimiter, upload.single('resume'), analyzeResume);

module.exports = router;
