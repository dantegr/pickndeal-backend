const User = require('../models/User');
const Otp = require('../models/Otp');
const UserRole = require('../models/UserRole');
const UserType = require('../models/UserType');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Get OTP for phone number
// @route   POST /api/getOtp
// @access  Public
exports.getOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Find or create user
    let user = await User.findOne({ phone_number });
    if (!user) {
      user = await User.create({ phone_number });
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
    const { phone_number, verification_code, device_token, device_type } = req.body;

    const user = await User.findOne({ phone_number });
    
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized',
        is_verified: false,
        token: null
      });
    }

    const otpData = await Otp.findOne({
      sender_id: user._id,
      receiver_id: user._id,
      section_id: 1
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
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit user details
// @route   POST /api/submitUserDetail
// @access  Private
exports.submitUserDetail = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    // Update user details
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by pre-save hook

    await user.save();

    res.status(200).json({
      message: 'User details updated successfully',
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit user roles
// @route   POST /api/submitUserRoles
// @access  Private
exports.submitUserRoles = async (req, res) => {
  try {
    const { user_roles } = req.body;
    const userId = req.user.id;

    if (user_roles && user_roles.length > 0) {
      for (const role of user_roles) {
        const existingRole = await UserRole.findOne({
          user_id: userId,
          user_type_id: role.id
        });

        if (!existingRole) {
          await UserRole.create({
            user_id: userId,
            user_type_id: role.id
          });
        }
      }
    } else {
      // If no roles provided, assign Customer role (you'll need to find the Customer UserType ID)
      const customerType = await UserType.findOne({ title: 'Customer' });
      if (customerType) {
        const existingRole = await UserRole.findOne({
          user_id: userId,
          user_type_id: customerType._id
        });

        if (!existingRole) {
          await UserRole.create({
            user_id: userId,
            user_type_id: customerType._id
          });
        }
      }
    }

    // Get user roles
    const userRoles = await UserRole.find({ user_id: userId })
      .populate('user_type_id', 'title');

    res.status(200).json({
      success: true,
      data: userRoles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user types
// @route   GET /api/getUserTypes
// @access  Public
exports.getUserTypes = async (req, res) => {
  try {
    const userTypes = await UserType.find({ title: { $ne: 'Customer' } });
    
    res.status(200).json({
      success: true,
      data: userTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user details
// @route   GET /api/getUser
// @access  Private
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    const userRoles = await UserRole.find({ user_id: userId })
      .populate('user_type_id', 'title');

    res.status(200).json({
      success: true,
      data: {
        user,
        roles: userRoles
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

// @desc    Update general profile data
// @route   POST /api/updateGeneralProfileData
// @access  Private
exports.updateGeneralProfileData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Handle image upload if needed
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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