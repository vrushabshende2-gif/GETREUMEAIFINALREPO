const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  toggleUserProfileLock, 
  unlockUserProfile, 
  restoreUserAccount,
  getAdminAnalytics,
  getSystemHealth,
  getUserResumeForAudit
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All routes below require: authenticated + isAdmin
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/toggle-lock', protect, adminOnly, toggleUserProfileLock);
router.put('/users/:id/unlock', protect, adminOnly, unlockUserProfile);
router.put('/users/:id/restore', protect, adminOnly, restoreUserAccount);
router.get('/analytics', protect, adminOnly, getAdminAnalytics);
router.get('/health', protect, adminOnly, getSystemHealth);
router.get('/users/:id/resume', protect, adminOnly, getUserResumeForAudit);

module.exports = router;

