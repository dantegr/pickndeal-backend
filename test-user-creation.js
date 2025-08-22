require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testUserCreation() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test phone number for testing
    const testPhoneNumber = '+1234567890' + Date.now(); // Unique phone number
    
    // Create a new user with just phone number (simulating getOtp flow)
    const newUser = await User.create({ phone_number: testPhoneNumber });
    
    console.log('\n=== New User Created ===');
    console.log('Phone Number:', newUser.phone_number);
    console.log('is_profile_completed:', newUser.is_profile_completed);
    console.log('is_verified:', newUser.is_verified);
    console.log('is_block:', newUser.is_block);
    console.log('is_pro:', newUser.is_pro);
    console.log('role:', newUser.role);
    
    // Verify the default values
    if (newUser.is_profile_completed === 0) {
      console.log('\n✓ SUCCESS: is_profile_completed is correctly set to 0');
    } else {
      console.log('\n✗ ERROR: is_profile_completed is', newUser.is_profile_completed, 'but should be 0');
    }
    
    // Clean up - delete test user
    await User.deleteOne({ _id: newUser._id });
    console.log('\nTest user deleted');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the test
testUserCreation();