const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test phone numbers
const testPhone1 = '+1234567890' + Date.now();
const testPhone2 = '+9876543210' + Date.now();

async function testSignupFlow() {
  console.log('=== Testing Signup Flow ===\n');
  
  try {
    // Test 1: Signup with new phone number
    console.log('1. Testing signup with new phone number:', testPhone1);
    const signupOtp = await axios.post(`${API_BASE_URL}/getOtpForSignup`, {
      phone_number: testPhone1
    });
    console.log('✓ OTP received for signup:', signupOtp.data.verification_code);
    
    // Test 2: Try to signup again with same phone number (should fail)
    console.log('\n2. Testing duplicate signup (should fail)...');
    try {
      await axios.post(`${API_BASE_URL}/getOtpForSignup`, {
        phone_number: testPhone1
      });
      console.log('✗ ERROR: Duplicate signup was allowed!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Duplicate signup correctly rejected:', error.response.data.message);
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }
    
    // Test 3: Verify OTP
    console.log('\n3. Verifying OTP...');
    const verifyResponse = await axios.post(`${API_BASE_URL}/verify`, {
      phone_number: testPhone1,
      verification_code: signupOtp.data.verification_code,
      section: 'signup'
    });
    console.log('✓ OTP verified, token received');
    const token = verifyResponse.data.token;
    
    // Test 4: Submit user details
    console.log('\n4. Submitting user details...');
    const userDetails = await axios.post(`${API_BASE_URL}/submitUserDetail`, 
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
        role: 'retailer'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✓ User details submitted successfully');
    
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLoginFlow() {
  console.log('\n=== Testing Login Flow ===\n');
  
  try {
    // Test 1: Try to login with non-existent phone
    console.log('1. Testing login with non-existent phone (should fail)...');
    try {
      await axios.post(`${API_BASE_URL}/getOtpForLogin`, {
        phone_number: '+0000000000'
      });
      console.log('✗ ERROR: Login with non-existent phone was allowed!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✓ Non-existent phone correctly rejected:', error.response.data.message);
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }
    
    // Test 2: Login with existing phone (using testPhone1 from signup)
    console.log('\n2. Testing login with existing phone:', testPhone1);
    const loginOtp = await axios.post(`${API_BASE_URL}/getOtpForLogin`, {
      phone_number: testPhone1
    });
    console.log('✓ OTP received for login:', loginOtp.data.verification_code);
    
    // Test 3: Verify login OTP
    console.log('\n3. Verifying login OTP...');
    const verifyResponse = await axios.post(`${API_BASE_URL}/verify`, {
      phone_number: testPhone1,
      verification_code: loginOtp.data.verification_code,
      section: 'login'
    });
    console.log('✓ Login OTP verified, token received');
    
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting authentication flow tests...\n');
  console.log('API Base URL:', API_BASE_URL);
  console.log('=====================================\n');
  
  const signupSuccess = await testSignupFlow();
  const loginSuccess = await testLoginFlow();
  
  console.log('\n=====================================');
  console.log('Test Results:');
  console.log('- Signup Flow:', signupSuccess ? '✓ PASSED' : '✗ FAILED');
  console.log('- Login Flow:', loginSuccess ? '✓ PASSED' : '✗ FAILED');
  console.log('=====================================\n');
  
  if (signupSuccess && loginSuccess) {
    console.log('All tests passed successfully! ✓');
    process.exit(0);
  } else {
    console.log('Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);