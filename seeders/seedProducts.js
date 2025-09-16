const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Load env vars
dotenv.config();

// Products for each category based on actual database categories
const productsData = {
  "Alcoholic Beverages": {
    uuid: "8d73baa6-e136-49b8-b1db-16e2212df3ef",
    unit: "Bottles",
    products: [
      { name: "Red Wine - Cabernet Sauvignon", unit_of_measurement: "Bottles" },
      { name: "White Wine - Chardonnay", unit_of_measurement: "Bottles" },
      { name: "Beer - Lager", unit_of_measurement: "Bottles" },
      { name: "Whiskey - Scotch", unit_of_measurement: "Bottles" },
      { name: "Vodka - Premium", unit_of_measurement: "Bottles" }
    ]
  },
  "Bakery & Desserts": {
    uuid: "f51491b2-4f72-4aa6-b39c-9761e8b6352c",
    unit: "Units",
    products: [
      { name: "French Baguette", unit_of_measurement: "Units" },
      { name: "Chocolate Cake", unit_of_measurement: "Units" },
      { name: "Croissants", unit_of_measurement: "Units" },
      { name: "Blueberry Muffins", unit_of_measurement: "Units" },
      { name: "Apple Pie", unit_of_measurement: "Units" }
    ]
  },
  "Beverages": {
    uuid: "37603eb3-eed3-4d58-b36d-423575fce5f3",
    unit: "Liters",
    products: [
      { name: "Orange Juice - Fresh", unit_of_measurement: "Liters" },
      { name: "Coca Cola", unit_of_measurement: "Liters" },
      { name: "Mineral Water", unit_of_measurement: "Liters" },
      { name: "Green Tea", unit_of_measurement: "Liters" },
      { name: "Coffee - Cold Brew", unit_of_measurement: "Liters" }
    ]
  },
  "Dairy Products": {
    uuid: "d973d49d-d7de-4fec-ae42-54928ce1651d",
    unit: "Liters",
    products: [
      { name: "Whole Milk", unit_of_measurement: "Liters" },
      { name: "Greek Yogurt", unit_of_measurement: "Liters" },
      { name: "Heavy Cream", unit_of_measurement: "Liters" },
      { name: "Buttermilk", unit_of_measurement: "Liters" },
      { name: "Chocolate Milk", unit_of_measurement: "Liters" }
    ]
  },
  "Frozen Foods": {
    uuid: "b54ccab8-90d9-4268-8d97-8556edb512e2",
    unit: "Kilograms",
    products: [
      { name: "Frozen Pizza Margherita", unit_of_measurement: "Kilograms" },
      { name: "Frozen Mixed Vegetables", unit_of_measurement: "Kilograms" },
      { name: "Ice Cream - Vanilla", unit_of_measurement: "Kilograms" },
      { name: "Frozen French Fries", unit_of_measurement: "Kilograms" },
      { name: "Frozen Chicken Nuggets", unit_of_measurement: "Kilograms" }
    ]
  },
  "Fruits": {
    uuid: "17c786c1-db68-4ff5-a6e0-7042ce740150",
    unit: "Kilograms",
    products: [
      { name: "Red Apples", unit_of_measurement: "Kilograms" },
      { name: "Bananas", unit_of_measurement: "Kilograms" },
      { name: "Oranges", unit_of_measurement: "Kilograms" },
      { name: "Strawberries", unit_of_measurement: "Kilograms" },
      { name: "Watermelon", unit_of_measurement: "Kilograms" }
    ]
  },
  "Grains & Pasta": {
    uuid: "247d4747-b01b-4ade-8f1a-c8470f1df863",
    unit: "Kilograms",
    products: [
      { name: "Basmati Rice", unit_of_measurement: "Kilograms" },
      { name: "Spaghetti Pasta", unit_of_measurement: "Kilograms" },
      { name: "Quinoa", unit_of_measurement: "Kilograms" },
      { name: "Whole Wheat Flour", unit_of_measurement: "Kilograms" },
      { name: "Penne Pasta", unit_of_measurement: "Kilograms" }
    ]
  },
  "Meat & Poultry": {
    uuid: "53502d04-bad9-4afa-9359-db4fd3575547",
    unit: "Kilograms",
    products: [
      { name: "Chicken Breast", unit_of_measurement: "Kilograms" },
      { name: "Ground Beef", unit_of_measurement: "Kilograms" },
      { name: "Pork Chops", unit_of_measurement: "Kilograms" },
      { name: "Lamb Leg", unit_of_measurement: "Kilograms" },
      { name: "Turkey Breast", unit_of_measurement: "Kilograms" }
    ]
  },
  "Oils & Condiments": {
    uuid: "000bcd8c-bcf8-409b-98e5-3a27b1dd17cc",
    unit: "Liters",
    products: [
      { name: "Extra Virgin Olive Oil", unit_of_measurement: "Liters" },
      { name: "Tomato Ketchup", unit_of_measurement: "Liters" },
      { name: "Soy Sauce", unit_of_measurement: "Liters" },
      { name: "Mayonnaise", unit_of_measurement: "Liters" },
      { name: "Balsamic Vinegar", unit_of_measurement: "Liters" }
    ]
  },
  "Seafood": {
    uuid: "288ebee2-132a-4b0f-a3b3-eb369e847b77",
    unit: "Kilograms",
    products: [
      { name: "Fresh Salmon Fillet", unit_of_measurement: "Kilograms" },
      { name: "Tiger Prawns", unit_of_measurement: "Kilograms" },
      { name: "Tuna Steaks", unit_of_measurement: "Kilograms" },
      { name: "Sea Bass Whole", unit_of_measurement: "Kilograms" },
      { name: "Calamari Rings", unit_of_measurement: "Kilograms" }
    ]
  },
  "Vegetables": {
    uuid: "c03060f7-2517-4aef-bcf2-bc26b79ce8fb",
    unit: "Kilograms",
    products: [
      { name: "Fresh Tomatoes", unit_of_measurement: "Kilograms" },
      { name: "Potatoes", unit_of_measurement: "Kilograms" },
      { name: "Onions", unit_of_measurement: "Kilograms" },
      { name: "Carrots", unit_of_measurement: "Kilograms" },
      { name: "Broccoli", unit_of_measurement: "Kilograms" }
    ]
  }
};

const seedProducts = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected\n');
    console.log('='.repeat(60));
    console.log('SEEDING PRODUCTS');
    console.log('='.repeat(60));

    // Clear existing products
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`\nClearing ${existingCount} existing products...`);
      await Product.deleteMany({});
      console.log('✓ Existing products cleared\n');
    }

    let totalAdded = 0;
    let totalFailed = 0;

    // Iterate through each category and add products
    for (const [categoryName, categoryData] of Object.entries(productsData)) {
      console.log(`\nProcessing: ${categoryName}`);
      console.log(`  UUID: ${categoryData.uuid}`);

      for (const product of categoryData.products) {
        try {
          const newProduct = await Product.create({
            name: product.name,
            unit_of_measurement: product.unit_of_measurement,
            category_id: categoryData.uuid
          });
          console.log(`  ✓ Added: ${product.name}`);
          totalAdded++;
        } catch (error) {
          console.log(`  ✗ Failed: ${product.name} - ${error.message}`);
          totalFailed++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SEEDING COMPLETED');
    console.log('='.repeat(60));
    console.log(`✓ Products added: ${totalAdded}`);
    if (totalFailed > 0) {
      console.log(`✗ Products failed: ${totalFailed}`);
    }

    // Verify final count
    const finalCount = await Product.countDocuments();
    console.log(`\nTotal products in database: ${finalCount}`);

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\nERROR:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeder
seedProducts();