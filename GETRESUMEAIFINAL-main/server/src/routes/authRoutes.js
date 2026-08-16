const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/logout', logoutUser);

const { validateRequest } = require('../middleware/validateRequest');
const rateLimit = require('express-rate-limit');
const {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validations/authValidations');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // Max 10 auth attempts per IP per 15 minutes
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateRequest(registerSchema), registerUser);
router.post('/verify-otp', authLimiter, validateRequest(verifyOtpSchema), verifyOTP);
router.post('/resend-otp', authLimiter, validateRequest(resendOtpSchema), resendOTP);
router.post('/login', authLimiter, validateRequest(loginSchema), loginUser);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);

router.get('/me', protect, async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, isAdmin: req.user.isAdmin });
});

module.exports = router;
