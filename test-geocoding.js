const { geocodeAddress } = require('./services/geocodingService');

// Test cases with various address inputs
const testCases = [
  {
    name: 'Complete valid address',
    data: {
      address: '1600 Amphitheatre Parkway',
      address2: '',
      city_id: 'Mountain View',
      state_id: 'CA',
      country_id: 'US',
      zip: '94043'
    }
  },
  {
    name: 'Address with valid country and state codes',
    data: {
      address: '123 Main Street',
      address2: '',
      city_id: 'New York',
      state_id: 'NY',
      country_id: 'US',
      zip: '10001'
    }
  },
  {
    name: 'Only country and state (fallback test)',
    data: {
      address: '',
      address2: '',
      city_id: '',
      state_id: 'CA',
      country_id: 'US',
      zip: ''
    }
  },
  {
    name: 'Random/invalid address text',
    data: {
      address: 'asdfghjkl qwerty',
      address2: '',
      city_id: 'InvalidCity',
      state_id: 'CA',
      country_id: 'US',
      zip: '12345'
    }
  },
  {
    name: 'Only country (ultimate fallback)',
    data: {
      address: '',
      address2: '',
      city_id: '',
      state_id: '',
      country_id: 'US',
      zip: ''
    }
  },
  {
    name: 'International address - UK',
    data: {
      address: '10 Downing Street',
      address2: '',
      city_id: 'London',
      state_id: '',
      country_id: 'GB',
      zip: 'SW1A 2AA'
    }
  },
  {
    name: 'Empty address (should return null)',
    data: {
      address: '',
      address2: '',
      city_id: '',
      state_id: '',
      country_id: '',
      zip: ''
    }
  }
];

async function runTests() {
  console.log('Starting geocoding tests...\n');
  
  for (const testCase of testCases) {
    console.log('=====================================');
    console.log(`Test: ${testCase.name}`);
    console.log('Input:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const result = await geocodeAddress(testCase.data);
      console.log('Result:', result);
      
      if (result.lat && result.lng) {
        console.log('✓ Geocoding successful');
      } else {
        console.log('✗ Geocoding returned null coordinates');
      }
    } catch (error) {
      console.log('✗ Error:', error.message);
    }
    
    console.log('=====================================\n');
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('All tests completed!');
}

// Run the tests
runTests().catch(console.error);