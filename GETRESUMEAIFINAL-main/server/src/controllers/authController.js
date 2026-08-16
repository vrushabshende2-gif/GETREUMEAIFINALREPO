const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, sendOTPEmail } = require('../services/otpService');

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  res.cookie('token', token, cookieOptions);
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    otp,
    otpExpiry,
    isVerified: false,
  });

  if (user) {
    try {
      await sendOTPEmail(email, otp);
      res.status(201).json({
        name: user.name,
        email: user.email,
        message: 'OTP sent to your email',
      });
    } catch (error) {
      console.error('OTP Send Error:', error.message);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'Email already verified' });
  }

  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: 'No OTP found. Please register again.' });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    message: 'Email verified successfully',
  });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'Email already verified' });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isVerified) {
    return res.status(401).json({
      message: 'Please verify your email first',
      needsVerification: true,
      email,
    });
  }

  if (user.isDeleted) {
    return res.status(403).json({ message: 'This account has been deleted. Contact admin for recovery.' });
  }

  if (await user.matchPassword(password)) {
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({ message: 'No user found with this email' });
  }

  if (!user.isVerified) {
    return res.status(400).json({ 
      message: 'Email not verified. Please verify first.',
      needsVerification: true,
      email 
    });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent to your email for password reset' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');

  if (!user) {
    return res.status(404).json({ message: 'No user found with this email' });
  }

  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ message: 'Password reset successfully' });
};

const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
};
