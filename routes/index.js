const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const productCategoryRoutes = require('./productCategory');
const requirementRoutes = require('./requirement');
const serviceRoutes = require('./service');
const orderRoutes = require('./order');
const userRoutes = require('./user');
const profileRoutes = require('./profile');
const chatRoutes = require('./chat');
const notificationRoutes = require('./notification');
const quotesRoutes = require('./quotes');

// Mount routes
router.use('/', authRoutes); // Auth routes at root level
router.use('/category', categoryRoutes);
router.use('/product', productRoutes);
router.use('/productCategory', productCategoryRoutes);
router.use('/requirement', requirementRoutes);
router.use('/service', serviceRoutes);
router.use('/order', orderRoutes);
router.use('/user', userRoutes);
router.use('/profile', profileRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/quotes', quotesRoutes);

module.exports = router;