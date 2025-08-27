const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const serviceRoutes = require('./service');
const orderRoutes = require('./order');
const userRoutes = require('./user');
const profileRoutes = require('./profile');

// Mount routes
router.use('/', authRoutes); // Auth routes at root level
router.use('/category', categoryRoutes);
router.use('/product', productRoutes);
router.use('/service', serviceRoutes);
router.use('/order', orderRoutes);
router.use('/user', userRoutes);
router.use('/profile', profileRoutes);

module.exports = router;