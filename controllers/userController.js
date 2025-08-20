const User = require('../models/User');

// @desc    Get countries
// @route   GET /api/countries
// @access  Public
exports.getCountries = async (req, res) => {
  try {
    // Mock data for now - in a real app you'd have a Country model
    const countries = [
      { id: 1, name: 'United States' },
      { id: 2, name: 'Canada' },
      { id: 3, name: 'United Kingdom' },
      { id: 4, name: 'India' },
      { id: 5, name: 'Australia' }
    ];

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
    
    // Mock data - in a real app you'd query based on countryId
    const states = [
      { id: 1, name: 'California', country_id: countryId },
      { id: 2, name: 'New York', country_id: countryId },
      { id: 3, name: 'Texas', country_id: countryId },
      { id: 4, name: 'Florida', country_id: countryId }
    ];

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
    const { stateId } = req.params;
    
    // Mock data - in a real app you'd query based on stateId
    const cities = [
      { id: 1, name: 'Los Angeles', state_id: stateId },
      { id: 2, name: 'San Francisco', state_id: stateId },
      { id: 3, name: 'San Diego', state_id: stateId },
      { id: 4, name: 'Sacramento', state_id: stateId }
    ];

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
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Mock data - in a real app you'd have a Category model
    const categories = [
      { id: 1, name: 'Electronics', title: 'Electronics' },
      { id: 2, name: 'Clothing', title: 'Clothing' },
      { id: 3, name: 'Home & Garden', title: 'Home & Garden' },
      { id: 4, name: 'Sports', title: 'Sports' },
      { id: 5, name: 'Books', title: 'Books' },
      { id: 6, name: 'Automotive', title: 'Automotive' },
      { id: 7, name: 'Food & Beverage', title: 'Food & Beverage' },
      { id: 8, name: 'Health & Beauty', title: 'Health & Beauty' }
    ];

    res.status(200).json(categories);
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

    // Mock profile data - in a real app you'd have separate models for addresses, categories etc
    res.status(200).json({
      success: true,
      profile: null, // No profile data initially
      cats: [] // No categories initially
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};