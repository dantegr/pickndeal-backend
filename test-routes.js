const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testRoutes() {
  console.log('\n=== Testing User Routes ===\n');

  // Test getUserTypes (public route)
  try {
    console.log('Testing GET /api/user/getUserTypes (public)...');
    const response = await axios.get(`${BASE_URL}/user/getUserTypes`);
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  // Test submitUserDetail (requires token from verify)
  try {
    console.log('\nTesting POST /api/user/submitUserDetail (requires token)...');
    const response = await axios.post(`${BASE_URL}/user/submitUserDetail`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'retailer'
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  // Test protected routes (should fail without token)
  try {
    console.log('\nTesting GET /api/user/getUser (protected, no token)...');
    const response = await axios.get(`${BASE_URL}/user/getUser`);
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Expected Error:', error.response?.data || error.message);
  }

  // Test protected routes with dummy token
  try {
    console.log('\nTesting POST /api/user/submitUserRoles (protected with invalid token)...');
    const response = await axios.post(
      `${BASE_URL}/user/submitUserRoles`,
      { user_roles: [] },
      { headers: { Authorization: 'Bearer invalid_token' } }
    );
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Expected Error:', error.response?.data || error.message);
  }

  console.log('\n=== Test Complete ===\n');
}

testRoutes().catch(console.error);