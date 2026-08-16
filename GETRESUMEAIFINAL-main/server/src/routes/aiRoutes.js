const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { 
  chatResumeAssistant, 
  generateResumeTest, 
  generateATSResume, 
  analyzeResumeATS,
  generateCoverLetter,
  polishBulletPoint
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Strict rate limiter for AI routes — prevents token/API abuse at scale
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 AI requests per IP per window
  message: { message: 'Too many AI requests. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI assistant and testing routes are private + rate-limited
router.use(protect);
router.use(aiLimiter);

router.post('/chatbot', chatResumeAssistant);
router.post('/generate-test', generateResumeTest);
router.post('/generate-resume', generateATSResume);
router.post('/analyze-ats', analyzeResumeATS);
router.post('/generate-cover-letter', generateCoverLetter);
router.post('/polish-bullet', polishBulletPoint);

module.exports = router;
