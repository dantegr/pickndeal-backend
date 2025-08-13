const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserType = require('../models/UserType');

// Load env vars
dotenv.config();

const userTypes = [
  { title: 'Customer', description: 'Regular customer' },
  { title: 'Supplier', description: 'Product supplier' },
  { title: 'Retailer', description: 'Retail business' },
  { title: 'Service Provider', description: 'Service provider' },
  { title: 'Recycler', description: 'Recycling service' },
  { title: 'Scrap Dealer', description: 'Scrap dealing business' },
  { title: 'Charitable Organization', description: 'Charitable organization' }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing user types
    await UserType.deleteMany({});
    console.log('Cleared existing user types');

    // Insert new user types
    await UserType.insertMany(userTypes);
    console.log('User types seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();