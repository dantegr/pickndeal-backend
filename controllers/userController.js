const User = require('../models/User');
const Profile = require('../models/Profile');
const UserRole = require('../models/UserRole');
const UserType = require('../models/UserType');
const jwt = require('jsonwebtoken');
const { Country, State, City } = require('country-state-city');

// @desc    Get countries
// @route   GET /api/countries
// @access  Public
exports.getCountries = async (req, res) => {
  try {
    const countries = Country.getAllCountries().map(country => ({
      id: country.isoCode,
      name: country.name,
      isoCode: country.isoCode,
      phonecode: country.phonecode,
      currency: country.currency
    }));
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get states by country
// @route   GET /api/states/:countryId
// @access  Public
exports.getStates = async (req, res) => {
  try {
    const { countryId } = req.params;
    // countryId here is the ISO code (e.g., 'US', 'IN', 'GB')
    const states = State.getStatesOfCountry(countryId).map(state => ({
      id: state.isoCode,
      name: state.name,
      country_id: countryId,
      isoCode: state.isoCode
    }));
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get cities by state
// @route   GET /api/cities/:stateId
// @access  Public
exports.getCities = async (req, res) => {
  try {
    const { countryId, stateId } = req.query;
    // We need both country and state ISO codes to get cities
    if (!countryId) {
      return res.status(400).json({
        success: false,
        message: 'Country ID is required'
      });
    }
    
    const cities = City.getCitiesOfState(countryId, stateId).map(city => ({
      id: city.name, // Using name as ID since there's no unique ID in the package
      name: city.name,
      state_id: stateId,
      country_id: countryId
    }));
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const { role } = req.query;
    
    let categories = [];
    
    if (role === 'retailer') {
      // Categories for retailers (food and drink businesses)
      categories = [
        { id: 1, name: 'Restaurant', title: 'Restaurant' },
        { id: 2, name: 'Fast Food', title: 'Fast Food' },
        { id: 3, name: 'Bar & Pub', title: 'Bar & Pub' },
        { id: 4, name: 'Cafe & Coffee Shop', title: 'Cafe & Coffee Shop' },
        { id: 5, name: 'Bakery', title: 'Bakery' },
        { id: 6, name: 'Food Truck', title: 'Food Truck' },
        { id: 7, name: 'Catering Service', title: 'Catering Service' },
        { id: 8, name: 'Grocery Store', title: 'Grocery Store' },
        { id: 9, name: 'Other', title: 'Other' }
      ];
    } else if (role === 'supplier') {
      // Categories for suppliers (food and restaurant supplies)
      categories = [
        { id: 1, name: 'Meat & Poultry Supplier', title: 'Meat & Poultry Supplier' },
        { id: 2, name: 'Vegetable & Fruit Producer', title: 'Vegetable & Fruit Producer' },
        { id: 3, name: 'Dairy Products Supplier', title: 'Dairy Products Supplier' },
        { id: 4, name: 'Beverage Distributor', title: 'Beverage Distributor' },
        { id: 5, name: 'Bakery Ingredients Supplier', title: 'Bakery Ingredients Supplier' },
        { id: 6, name: 'Seafood Supplier', title: 'Seafood Supplier' },
        { id: 7, name: 'Kitchen Equipment Supplier', title: 'Kitchen Equipment Supplier' },
        { id: 8, name: 'Packaging & Disposables', title: 'Packaging & Disposables' },
        { id: 9, name: 'Other', title: 'Other' }
      ];
    } else {
      // Default categories if no role specified
      categories = [
        { id: 1, name: 'Food & Beverage', title: 'Food & Beverage' },
        { id: 2, name: 'Restaurant Supplies', title: 'Restaurant Supplies' },
        { id: 3, name: 'Other', title: 'Other' }
      ];
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update general user data
// @route   POST /api/updateGeneralUserData
// @access  Private
exports.updateGeneralUserData = async (req, res) => {
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

// @desc    Submit user details
// @route   POST /api/submitUserDetail
// @access  Public (but requires valid token from verify)
exports.submitUserDetail = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Extract token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'No token provided. Please verify your phone number first.',
        success: false
      });
    }

    // Verify token and get user ID
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid or expired token. Please verify your phone number again.',
        success: false
      });
    }

    const userId = decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }

    // Check if user details are already completed (prevent overwriting)
    if (user.email && user.password) {
      return res.status(400).json({
        message: 'User details have already been submitted',
        success: false
      });
    }

    // Update user details
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by pre-save hook
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: 'User details updated successfully',
      success: true,
      is_profile_completed: user.is_profile_completed
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

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user profile if it exists
    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: profile,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all suppliers with completed profiles
// @route   GET /api/user/suppliers
// @access  Protected
exports.getSuppliers = async (req, res) => {
  try {
    // Find all suppliers with completed profiles using the role field directly
    const suppliers = await User.find({
      role: 'supplier',
      is_profile_completed: 1
    })
    .select('name email is_profile_completed image');

    // Format the response to match frontend expectations
    const formattedSuppliers = await Promise.all(suppliers.map(async (supplier) => {
      // Get the profile for this user using user_id field
      const profile = await Profile.findOne({ user_id: supplier._id });
      
      return {
        id: supplier._id,
        _id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        businessType: profile?.businessType || 'Supplier',
        categories: profile?.categories || [],
        deliveryRadius: profile?.deliveryRadius || 50,
        lat: profile?.lat || 0,
        lng: profile?.lng || 0,
        address: profile?.address || '',
        rating: profile?.rating || 0,
        image: supplier.image || profile?.avatarImage || null,
        avatarColor: profile?.avatarColor || '#2e42e2',
        phone: profile?.phone || '',
        city: profile?.city_id || '',
        state: profile?.state_id || '',
        country: profile?.country_id || ''
      };
    }));

    res.status(200).json({
      success: true,
      data: formattedSuppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};