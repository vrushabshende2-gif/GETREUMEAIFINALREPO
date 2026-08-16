const TestResult = require('../models/TestResult');
const Resume = require('../models/Resume');

/**
 * @desc    Save test execution outcomes
 * @route   POST /api/tests/results
 * @access  Private
 */
const saveTestResult = async (req, res) => {
  try {
    const { resumeId, score, correctAnswers, totalQuestions, switchStrikes, answers } = req.body;

    if (!resumeId || score === undefined || correctAnswers === undefined || !answers) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Verify resume exists
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Matching resume context not found' });
    }

    const testResult = await TestResult.create({
      userId: req.user._id,
      resumeId,
      score,
      totalQuestions: totalQuestions || 10,
      correctAnswers,
      switchStrikes: switchStrikes || 0,
      answers
    });

    res.status(201).json(testResult);
  } catch (error) {
    console.error('Save Test Result Error:', error);
    res.status(500).json({ message: 'Failed to record test completion stats' });
  }
};

/**
 * @desc    Get all test results for current user
 * @route   GET /api/tests/results
 * @access  Private
 */
const getTestResults = async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user._id })
      .populate('resumeId', 'title')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Fetch Test Results Error:', error);
    res.status(500).json({ message: 'Failed to load test scorecard logs' });
  }
};

/**
 * @desc    Get details of a specific test run
 * @route   GET /api/tests/results/:id
 * @access  Private
 */
const getTestResultDetail = async (req, res) => {
  try {
    const result = await TestResult.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId', 'title');

    if (!result) {
      return res.status(404).json({ message: 'Test execution card not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Fetch Test Result Details Error:', error);
    res.status(500).json({ message: 'Failed to load test report detail' });
  }
};

module.exports = {
  saveTestResult,
  getTestResults,
  getTestResultDetail
};
