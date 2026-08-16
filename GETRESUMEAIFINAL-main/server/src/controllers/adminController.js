const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const AtsScan = require('../models/AtsScan');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get ALL users including deleted (for admin audit panel)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // Return ALL documents (active + soft-deleted) for security audit
  const users = await User.find({})
    .select('-password -otp -otpExpiry')
    .sort({ createdAt: -1 });

  res.json(users);
});

// @desc    Toggle profileLocked for a specific user (admin only)
// @route   PUT /api/admin/users/:id/toggle-lock
// @access  Private/Admin
const toggleUserProfileLock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.profileLocked = !user.profileLocked;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileLocked: user.profileLocked,
    isAdmin: user.isAdmin,
    lastLogin: user.lastLogin,
    isDeleted: user.isDeleted,
    deletedAt: user.deletedAt,
    createdAt: user.createdAt,
  });
});

// @desc    Manually unlock a user profile (admin only)
// @route   PUT /api/admin/users/:id/unlock
// @access  Private/Admin
const unlockUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.profileLocked = false;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileLocked: user.profileLocked,
    isAdmin: user.isAdmin,
    lastLogin: user.lastLogin,
    isDeleted: user.isDeleted,
    deletedAt: user.deletedAt,
    createdAt: user.createdAt,
  });
});

// @desc    Restore a soft-deleted account (admin only)
// @route   PUT /api/admin/users/:id/restore
// @access  Private/Admin
const restoreUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isDeleted = false;
  user.deletedAt = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isDeleted: user.isDeleted,
    message: 'Account restored successfully.',
  });
});

// @desc    Get Comprehensive Platform Analytics & Metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, deletedUsers, totalResumes, totalJobs, totalScans] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ isDeleted: true }),
    Resume.countDocuments({}),
    Job.countDocuments({}),
    AtsScan.countDocuments({}),
  ]);

  // Aggregate top 8 market skills across all stored resumes
  const skillAggregation = await Resume.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  const topSkills = skillAggregation.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    count: s.count
  }));

  // Average ATS Score across resumes with an ATS score
  const avgScoreAgg = await Resume.aggregate([
    { $match: { atsScore: { $gt: 0 } } },
    { $group: { _id: null, avgScore: { $avg: '$atsScore' } } }
  ]);
  const avgAtsScore = avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].avgScore) : 78;

  res.json({
    metrics: {
      totalUsers,
      activeUsers,
      deletedUsers,
      totalResumes,
      totalJobs,
      totalScans,
      avgAtsScore
    },
    topSkills,
  });
});

// @desc    Get System & Service Health Diagnostics
// @route   GET /api/admin/health
// @access  Private/Admin
const getSystemHealth = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Degraded';
  const groqStatus = process.env.GROQ_API_KEY ? 'Connected' : 'Missing API Key';
  const emailStatus = process.env.EMAIL_USER && process.env.EMAIL_PASS ? 'Configured' : 'Unset';

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  res.json({
    status: 'Operational',
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: { name: 'MongoDB Atlas', status: dbStatus, connected: mongoose.connection.readyState === 1 },
      aiEngine: { name: 'Proprietary AI Engine', status: groqStatus, model: 'v3.3' },
      emailService: { name: 'Nodemailer SMTP', status: emailStatus },
    },
    system: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
    }
  });
});

// @desc    Get latest user resume for security/support audit
// @route   GET /api/admin/users/:id/resume
// @access  Private/Admin
const getUserResumeForAudit = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ userId: req.params.id }).sort({ updatedAt: -1 });
  if (!resume) {
    return res.status(404).json({ message: 'No resume found for this user.' });
  }
  res.json(resume);
});

module.exports = {
  getAllUsers,
  toggleUserProfileLock,
  unlockUserProfile,
  restoreUserAccount,
  getAdminAnalytics,
  getSystemHealth,
  getUserResumeForAudit,
};


