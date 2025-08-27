const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { completeProfile } = require('../controllers/profileController');

// Protected routes for profile management
router.post('/complete-profile', protect, completeProfile);

module.exports = router;