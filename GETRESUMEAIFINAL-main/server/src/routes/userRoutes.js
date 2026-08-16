const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers, getUserById, updateUserProfile, deleteUserAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
});

// IMPORTANT: /profile must come BEFORE /:id — Express matches routes in order.
// If /:id comes first, GET /profile is captured with id="profile" (invalid ObjectId).
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/account', protect, deleteUserAccount);

router.get('/all', protect, getAllUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
