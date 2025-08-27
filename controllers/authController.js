const User = require('../models/User');
const Otp = require('../models/Otp');
const UserRole = require('../models/UserRole');
const UserType = require('../models/UserType');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { geocodeAddress } = require('../services/geocodingService');

// @desc    Get OTP for signup (new users only)
// @route   POST /api/getOtpForSignup
// @access  Public
exports.getOtpForSignup = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login instead.'
      });
    }

    // Create new user
    const user = await User.create({ phone_number });

    // Generate OTP
    const verification_code = Math.floor(1000 + Math.random() * 9000);

    // Create OTP record
    await Otp.create({
      sender_id: user._id,
      receiver_id: user._id,
      sender_type: 'User',
      receiver_type: 'User',
      otp: verification_code,
      status: 'open',
      section: 'signup',
      section_id: 1
    });

    // In production, send SMS here
    // For development, return OTP in response
    res.status(200).json({
      verification_code: verification_code,
      is_verified: false,
      message: 'OTP sent successfully for signup'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get OTP for login (existing users only)
// @route   POST /api/getOtpForLogin
// @access  Public
exports.getOtpForLogin = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Find existing user
    const user = await User.findOne({ phone_number });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found. Please sign up first.'
      });
    }

    // Check if user is blocked
    if (user.is_block) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been blocked'
      });
    }

    // Check if OTP already exists
    let otpData = await Otp.findOne({
      sender_id: user._id,
      receiver_id: user._id,
      section_id: 2 // login section
    });

    const verification_code = Math.floor(1000 + Math.random() * 9000);

    if (!otpData) {
      otpData = await Otp.create({
        sender_id: user._id,
        receiver_id: user._id,
        sender_type: 'User',
        receiver_type: 'User',
        otp: verification_code,
        status: 'open',
        section: 'login',
        section_id: 2
      });
    } else {
      otpData.otp = verification_code;
      await otpData.save();
    }

    // In production, send SMS here
    // For development, return OTP in response
    res.status(200).json({
      verification_code: verification_code,
      is_verified: user.is_verified,
      message: 'OTP sent successfully for login'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get OTP for phone number update (protected - for authenticated users)
// @route   POST /api/getOtp
// @access  Private
exports.getOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const userId = req.user.id; // This requires authentication

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if phone number is already taken by another user
    const existingUser = await User.findOne({ 
      phone_number, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already in use by another account'
      });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP already exists
    let otpData = await Otp.findOne({
      sender_id: user._id,
      receiver_id: user._id,
      section_id: 1 // signup section
    });

    const verification_code = Math.floor(1000 + Math.random() * 9000);

    if (!otpData) {
      otpData = await Otp.create({
        sender_id: user._id,
        receiver_id: user._id,
        sender_type: 'User',
        receiver_type: 'User',
        otp: verification_code,
        status: 'open',
        section: 'signup',
        section_id: 1
      });
    } else {
      otpData.otp = verification_code;
      await otpData.save();
    }

    // In production, send SMS here
    // For development, return OTP in response
    res.status(200).json({
      verification_code: verification_code,
      is_verified: false,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/verify
// @access  Public
exports.verify = async (req, res) => {
  try {
    const { phone_number, verification_code, device_token, device_type, section = 'signup' } = req.body;

    const user = await User.findOne({ phone_number });
    
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized',
        is_verified: false,
        token: null
      });
    }

    // Determine section_id based on section type
    const section_id = section === 'login' ? 2 : 1;

    const otpData = await Otp.findOne({
      sender_id: user._id,
      receiver_id: user._id,
      section_id: section_id
    });

    if (!otpData || otpData.otp !== parseInt(verification_code)) {
      return res.status(401).json({
        message: 'Invalid verification code',
        is_verified: false,
        token: null
      });
    }

    if (user.is_block) {
      return res.status(401).json({
        message: 'Your account has been blocked',
        is_verified: null,
        token: null
      });
    }

    // Update user
    user.is_verified = true;
    user.device_token = device_token;
    user.device_type = device_type;
    await user.save();

    // Delete OTP
    await otpData.deleteOne();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      message: 'User verified successfully',
      is_verified: user.email ? true : false,
      is_profile_completed: user.is_profile_completed,
      token: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login with password
// @route   POST /api/loginWithPassword
// @access  Public
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, phone_number, password, device_token, device_type } = req.body;

    // Validate input - accept either email or phone_number
    if ((!email && !phone_number) || !password) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Please provide email/phone number and password',
        token: null
      });
    }

    // Build query to find user by email or phone
    let query = {};
    if (email) {
      query.email = email.toLowerCase();
    } else if (phone_number) {
      query.phone_number = phone_number;
    }

    // Check for user
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({
        isSuccess: false,
        message: 'Invalid credentials',
        token: null
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        isSuccess: false,
        message: 'Invalid credentials',
        token: null
      });
    }

    // Check if user is blocked
    if (user.is_block) {
      return res.status(401).json({
        message: 'Your account has been blocked'
      });
    }

    // Update device info
    if (device_token) user.device_token = device_token;
    if (device_type) user.device_type = device_type;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      isSuccess: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        is_profile_completed: user.is_profile_completed,
        userRole: user.role ? { 
          role: user.role 
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/resetPassword
// @access  Private
exports.resetPassword = async (req, res) => {
  try {
    const { current_password, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(current_password);
    
    if (!isMatch) {
      return res.status(401).json({
        error: 'Current password does not match'
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Change password
// @route   POST /api/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if new password and confirm password match
    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if old password is correct
    const isMatch = await user.matchPassword(old_password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Check if new password is same as old password
    if (old_password === new_password) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from old password'
      });
    }

    // Update password
    user.password = new_password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password. Please try again.'
    });
  }
};

// @desc    Logout user
// @route   POST /api/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear device tokens
    await User.findByIdAndUpdate(userId, {
      device_token: null,
      device_type: null
    });

    res.status(200).json({
      message: 'User logged out successfully',
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};