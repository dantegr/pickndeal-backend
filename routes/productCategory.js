const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getAllProductCategories,
  getProductCategory
} = require('../controllers/productCategoryController');

// All routes are protected (require authentication)
router.get('/getAll', protect, getAllProductCategories);
router.get('/get/:id', protect, getProductCategory);
router.post('/create', protect, createProductCategory);
router.put('/update/:id', protect, updateProductCategory);
router.delete('/delete/:id', protect, deleteProductCategory);

module.exports = router;