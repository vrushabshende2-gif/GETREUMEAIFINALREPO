const express = require('express');
const router = express.Router();
const { 
  saveTestResult, 
  getTestResults, 
  getTestResultDetail 
} = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/results', saveTestResult);
router.get('/results', getTestResults);
router.get('/results/:id', getTestResultDetail);

module.exports = router;
