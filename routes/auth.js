const express = require('express');
const router = express.Router();
const {
  getOtp,
  getOtpForSignup,
  getOtpForLogin,
  verify,
  loginWithPassword,
  resetPassword,
  changePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/getOtpForSignup', getOtpForSignup); // New endpoint for signup
router.post('/getOtpForLogin', getOtpForLogin);   // New endpoint for login with OTP
router.post('/verify', verify);
router.post('/loginWithPassword', loginWithPassword);

// Protected routes - apply protect middleware to each route individually
router.post('/getOtp', protect, getOtp); // Now protected - for phone number updates
router.post('/resetPassword', protect, resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;