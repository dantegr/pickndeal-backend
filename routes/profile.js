const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { completeProfile, getProfile, updateProfile, uploadAvatar, deleteAvatar } = require('../controllers/profileController');
const { upload } = require('../config/cloudinary');

// Protected routes for profile management
router.post('/complete-profile', protect, completeProfile);

// Get profile routes - current user or specific user
router.get('/', protect, getProfile);  // Get current user's profile
router.get('/:userId', protect, getProfile);  // Get specific user's profile

// Update profile routes - current user or specific user
router.put('/update', protect, updateProfile);  // Update current user's profile
router.put('/update/:userId', protect, updateProfile);  // Update specific user's profile

// Avatar upload routes - protected
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);  // Upload avatar image
router.delete('/avatar', protect, deleteAvatar);  // Delete avatar image

module.exports = router;