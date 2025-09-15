require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const ProductCategory = require('../models/ProductCategory');

// Food and drink supply categories for restaurants and bars
const productCategories = [
  {
    name: 'Beverages',
    unit_of_measurement: 'Liters'
  },
  {
    name: 'Meat & Poultry',
    unit_of_measurement: 'Kilograms'
  },
  {
    name: 'Seafood',
    unit_of_measurement: 'Kilograms'
  },
  {
    name: 'Dairy Products',
    unit_of_measurement: 'Liters'
  },
  {
    name: 'Fruits',
    unit_of_measurement: 'Kilograms'
  },
  {
    name: 'Vegetables',
    unit_of_measurement: 'Kilograms'
  },
  {
    name: 'Alcoholic Beverages',
    unit_of_measurement: 'Bottles'
  },
  {
    name: 'Grains & Pasta',
    unit_of_measurement: 'Kilograms'
  },
  {
    name: 'Oils & Condiments',
    unit_of_measurement: 'Liters'
  },
  {
    name: 'Frozen Foods',
    unit_of_measurement: 'Kilograms'
  },
  {
    name: 'Bakery & Desserts',
    unit_of_measurement: 'Units'
  }
];

const seedProductCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/pickndeal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing product categories
    const deleteResult = await ProductCategory.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing product categories`);

    // Insert new product categories
    const insertedCategories = await ProductCategory.insertMany(productCategories);
    console.log(`Successfully created ${insertedCategories.length} product categories:`);
    
    // Display created categories
    insertedCategories.forEach(category => {
      console.log(`- ${category.name} (${category.unit_of_measurement}) - UUID: ${category.uuid}`);
    });

    console.log('\nProduct categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding product categories:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProductCategories();