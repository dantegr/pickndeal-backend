const express = require('express');
const router = express.Router();
const {
  getOtp,
  getOtpForSignup,
  getOtpForLogin,
  verify,
  loginWithPassword,
  submitUserDetail,
  submitUserRoles,
  getUserTypes,
  getUserDetails,
  resetPassword,
  updateGeneralProfileData,
  completeProfile,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/getOtpForSignup', getOtpForSignup); // New endpoint for signup
router.post('/getOtpForLogin', getOtpForLogin);   // New endpoint for login with OTP
router.post('/verify', verify);
router.post('/submitUserDetail', submitUserDetail); // Public but requires token from verify
router.post('/loginWithPassword', loginWithPassword);
router.get('/getUserTypes', getUserTypes);

// Protected routes
router.use(protect); // All routes below this will require authentication
router.post('/getOtp', getOtp); // Now protected - for phone number updates
router.post('/submitUserRoles', submitUserRoles);
router.get('/getUser', getUserDetails);
router.post('/resetPassword', resetPassword);
router.post('/updateGeneralProfileData', updateGeneralProfileData);
router.post('/save/profile', completeProfile);
router.post('/logout', logout);

module.exports = router;