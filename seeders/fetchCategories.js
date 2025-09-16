const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ProductCategory = require('../models/ProductCategory');

// Load env vars
dotenv.config();

const fetchCategories = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected\n');
    console.log('='.repeat(60));
    console.log('FETCHING ALL CATEGORIES FROM DATABASE');
    console.log('='.repeat(60));

    // Fetch all categories
    const categories = await ProductCategory.find().sort({ name: 1 });

    console.log(`\nFound ${categories.length} categories:\n`);

    // Display all category details
    categories.forEach((category, index) => {
      console.log(`Category ${index + 1}:`);
      console.log(`  Name: ${category.name}`);
      console.log(`  UUID: ${category.uuid}`);
      console.log(`  Unit of Measurement: ${category.unit_of_measurement}`);
      console.log(`  MongoDB ID: ${category._id}`);
      console.log(`  Created: ${category.createdAt}`);
      console.log('-'.repeat(40));
    });

    // Also output as JSON for easy copying
    console.log('\n' + '='.repeat(60));
    console.log('CATEGORIES AS JSON:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(categories.map(cat => ({
      name: cat.name,
      uuid: cat.uuid,
      unit_of_measurement: cat.unit_of_measurement
    })), null, 2));

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');

  } catch (error) {
    console.error('Error fetching categories:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
fetchCategories();