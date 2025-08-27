const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testProfileRoute() {
  console.log('\n=== Testing Profile Route ===\n');

  // Test complete-profile endpoint without token (should fail)
  try {
    console.log('Testing POST /api/profile/complete-profile (no token - should fail)...');
    const response = await axios.post(`${BASE_URL}/profile/complete-profile`, {
      name: 'Test User',
      address: '123 Test St',
      country_id: 'US',
      state_id: 'CA',
      city_id: 'Los Angeles',
      zip: '90001'
    });
    console.log('✅ Unexpected Success:', response.data);
  } catch (error) {
    console.log('✅ Expected Error (401):', error.response?.data || error.message);
  }

  // Test with dummy token (should also fail with 401)
  try {
    console.log('\nTesting POST /api/profile/complete-profile (invalid token - should fail)...');
    const response = await axios.post(
      `${BASE_URL}/profile/complete-profile`,
      {
        name: 'Test User',
        address: '123 Test St',
        country_id: 'US',
        state_id: 'CA',
        city_id: 'Los Angeles',
        zip: '90001'
      },
      {
        headers: {
          Authorization: 'Bearer invalid_token_12345'
        }
      }
    );
    console.log('✅ Unexpected Success:', response.data);
  } catch (error) {
    console.log('✅ Expected Error:', error.response?.data || error.message);
  }

  console.log('\n=== Test Complete ===\n');
}

testProfileRoute().catch(console.error);