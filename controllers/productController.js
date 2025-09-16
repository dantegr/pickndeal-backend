const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');

// @desc    Create new product
// @route   POST /api/product/create
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const { name, unit_of_measurement, category_id } = req.body;

    // Validate input
    if (!name || !unit_of_measurement || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, unit of measurement, and category ID'
      });
    }

    // Check if category exists by UUID
    const category = await ProductCategory.findOne({ uuid: category_id });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category does not exist in the database'
      });
    }

    // Create new product
    const product = await Product.create({
      name,
      unit_of_measurement,
      category_id
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/product/update/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit_of_measurement, category_id } = req.body;

    // Find product by UUID or MongoDB ID
    let product = await Product.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If category_id is being updated, check if it exists
    if (category_id) {
      const category = await ProductCategory.findOne({ uuid: category_id });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist in the database'
        });
      }
      product.category_id = category_id;
    }

    // Update other fields
    if (name) product.name = name;
    if (unit_of_measurement) product.unit_of_measurement = unit_of_measurement;

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/product/delete/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by UUID or MongoDB ID
    const product = await Product.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/product/getAll
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });

    // Manually populate category information
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        const category = await ProductCategory.findOne({ uuid: product.category_id });
        return {
          ...product.toObject(),
          category: category
        };
      })
    );

    res.status(200).json({
      success: true,
      count: productsWithCategory.length,
      data: productsWithCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/product/get/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by UUID or MongoDB ID
    const product = await Product.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get category information
    const category = await ProductCategory.findOne({ uuid: product.category_id });

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        category: category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get products by category ID
// @route   GET /api/product/getByCategory/:categoryId
// @access  Public
exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists (categoryId should be UUID)
    const category = await ProductCategory.findOne({ uuid: categoryId });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Find all products with this category UUID
    const products = await Product.find({ category_id: categoryId })
      .sort({ name: 1 });

    // Add category information to each product
    const productsWithCategory = products.map(product => ({
      ...product.toObject(),
      category: category
    }));

    res.status(200).json({
      success: true,
      count: productsWithCategory.length,
      data: productsWithCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};