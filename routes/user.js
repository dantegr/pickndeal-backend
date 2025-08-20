const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCountries,
  getStates,
  getCities,
  getCategories,
  getUserProfile
} = require('../controllers/userController');

// Placeholder endpoints for user-related operations
router.post('/submitUserCompanyProfile', protect, (req, res) => {
  res.json({ message: 'Submit user company profile - To be implemented' });
});

router.get('/getUserCompanyProfile', protect, (req, res) => {
  res.json({ message: 'Get user company profile - To be implemented' });
});

router.get('/getOldServiceProvider', protect, (req, res) => {
  res.json({ message: 'Get old service provider - To be implemented' });
});

router.post('/saveAddress', protect, (req, res) => {
  res.json({ message: 'Save address - To be implemented' });
});

router.get('/getSavedAddresses', protect, (req, res) => {
  res.json({ message: 'Get saved addresses - To be implemented' });
});

router.get('/getAllSubscriptions', protect, (req, res) => {
  res.json({ message: 'Get all subscriptions - To be implemented' });
});

router.post('/submitUserSubscription', protect, (req, res) => {
  res.json({ message: 'Submit user subscription - To be implemented' });
});

router.post('/saveFavouriteItem', protect, (req, res) => {
  res.json({ message: 'Save favourite item - To be implemented' });
});

router.delete('/deleteFavouriteItem', protect, (req, res) => {
  res.json({ message: 'Delete favourite item - To be implemented' });
});

router.get('/getMyWishlist', protect, (req, res) => {
  res.json({ message: 'Get my wishlist - To be implemented' });
});

router.get('/notification', protect, (req, res) => {
  res.json({ message: 'Get notifications - To be implemented' });
});

router.put('/markNotificationsAsRead', protect, (req, res) => {
  res.json({ message: 'Mark notifications as read - To be implemented' });
});

// Protected routes for location and categories
router.get('/countries', protect, getCountries);
router.get('/states/:countryId', protect, getStates);
router.get('/cities', protect, getCities); // Changed to use query params
router.get('/categories', protect, getCategories);

// Protected routes
router.get('/profile', protect, getUserProfile);

router.get('/getMultipleCities', protect, (req, res) => {
  res.json({ message: 'Get multiple cities - To be implemented' });
});

module.exports = router;