const express = require('express');
const router = express.Router();
const {
  getOtp,
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
router.post('/getOtp', getOtp);
router.post('/verify', verify);
router.post('/loginWithPassword', loginWithPassword);
router.get('/getUserTypes', getUserTypes);

// Protected routes
router.use(protect); // All routes below this will require authentication
router.post('/submitUserDetail', submitUserDetail);
router.post('/submitUserRoles', submitUserRoles);
router.get('/getUser', getUserDetails);
router.post('/resetPassword', resetPassword);
router.post('/updateGeneralProfileData', updateGeneralProfileData);
router.post('/save/timeslots', completeProfile);
router.post('/logout', logout);

module.exports = router;