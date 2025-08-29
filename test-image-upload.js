const imageUploadService = require('./services/imageUploadService');
const { cloudinary } = require('./config/cloudinary');
require('dotenv').config();

async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  try {
    const result = await cloudinary.api.ping();
    console.log('✓ Cloudinary connection successful:', result);
    
    const base64TestImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log('\nTesting base64 image upload...');
    const uploadResult = await imageUploadService.uploadBase64Image(base64TestImage, 'test');
    console.log('✓ Image uploaded successfully:');
    console.log('  URL:', uploadResult.url);
    console.log('  Public ID:', uploadResult.publicId);
    
    console.log('\nTesting image deletion...');
    const deleteResult = await imageUploadService.deleteImage(uploadResult.publicId);
    console.log('✓ Image deleted successfully:', deleteResult);
    
    console.log('\n✅ All tests passed! Image upload service is ready to use.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCloudinaryConnection();