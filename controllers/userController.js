const User = require('../models/User');
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