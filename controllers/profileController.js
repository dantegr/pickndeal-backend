const User = require('../models/User');
const Profile = require('../models/Profile');
const { geocodeAddress } = require('../services/geocodingService');
const imageUploadService = require('../services/imageUploadService');

// @desc    Complete user profile
// @route   POST /api/save/profile
// @access  Private
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      address,
      address2,
      country_id,
      state_id,
      city_id,
      zip,
      aboutme,
      timeSlots,
      cats,
      lat,
      lng,
      deliveryRadius
    } = req.body;

    // Parse timeSlots if it's a string
    let parsedTimeSlots = timeSlots;
    if (typeof timeSlots === 'string') {
      try {
        parsedTimeSlots = JSON.parse(timeSlots);
      } catch (e) {
        parsedTimeSlots = [];
      }
    }

    // Convert category IDs to category names
    // Get the user's role to determine which category list to use
    const user = await User.findById(userId);
    const userRole = user.role || 'retailer';
    
    let categoryNames = [];
    if (cats && Array.isArray(cats)) {
      // Define categories based on role (same as in getCategories)
      let categoryList = [];
      if (userRole === 'retailer') {
        categoryList = [
          { id: 1, name: 'Restaurant' },
          { id: 2, name: 'Fast Food' },
          { id: 3, name: 'Bar & Pub' },
          { id: 4, name: 'Cafe & Coffee Shop' },
          { id: 5, name: 'Bakery' },
          { id: 6, name: 'Food Truck' },
          { id: 7, name: 'Catering Service' },
          { id: 8, name: 'Grocery Store' },
          { id: 9, name: 'Other' }
        ];
      } else if (userRole === 'supplier') {
        categoryList = [
          { id: 1, name: 'Meat & Poultry Supplier' },
          { id: 2, name: 'Vegetable & Fruit Producer' },
          { id: 3, name: 'Dairy Products Supplier' },
          { id: 4, name: 'Beverage Distributor' },
          { id: 5, name: 'Bakery Ingredients Supplier' },
          { id: 6, name: 'Seafood Supplier' },
          { id: 7, name: 'Kitchen Equipment Supplier' },
          { id: 8, name: 'Packaging & Disposables' },
          { id: 9, name: 'Other' }
        ];
      }
      
      // Map IDs to names
      categoryNames = cats.map(catId => {
        const category = categoryList.find(cat => cat.id === parseInt(catId));
        return category ? category.name : catId.toString();
      });
    }

    // Geocode the address if lat/lng not provided
    let finalLat = lat;
    let finalLng = lng;
    
    if (!lat || !lng) {
      console.log('Lat/Lng not provided, attempting to geocode address');
      const geocodeResult = await geocodeAddress({
        address,
        address2,
        city_id,
        state_id,
        country_id,
        zip
      });
      
      if (geocodeResult.lat && geocodeResult.lng) {
        finalLat = geocodeResult.lat;
        finalLng = geocodeResult.lng;
        console.log(`Geocoding successful - Lat: ${finalLat}, Lng: ${finalLng}`);
      } else {
        console.log('Geocoding failed, using null values for lat/lng');
      }
    }

    // Create or update profile
    const profileData = {
      user_id: userId,
      name: name || req.user.name,
      address,
      address2: address2 || '',
      country_id,
      state_id,
      city_id: city_id || '',
      zip,
      aboutme,
      timeSlots: parsedTimeSlots || [],
      categories: categoryNames,
      lat: finalLat || null,
      lng: finalLng || null
    };

    // Add deliveryRadius if provided (optional field)
    if (deliveryRadius !== undefined && deliveryRadius !== null) {
      profileData.deliveryRadius = deliveryRadius;
    }

    // Use upsert to create or update
    const profile = await Profile.findOneAndUpdate(
      { user_id: userId },
      profileData,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    // Update user to mark profile as completed
    await User.findByIdAndUpdate(userId, {
      name: name || req.user.name,
      is_profile_completed: 1
    });

    res.status(200).json({
      type: 'success',
      message: 'Profile completed successfully',
      to: '/dashboard'
    });
  } catch (error) {
    res.status(500).json({
      type: 'error',
      message: error.message
    });
  }
};

// @desc    Get user profile by user ID
// @route   GET /api/profile/:userId
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Find the profile by user_id
    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        type: 'error',
        message: 'Profile not found'
      });
    }
    
    res.status(200).json({
      type: 'success',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      type: 'error',
      message: error.message
    });
  }
};

// @desc    Update user profile by user ID
// @route   PUT /api/profile/:userId
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Find the profile first to ensure it exists
    const existingProfile = await Profile.findOne({ user_id: userId });
    
    if (!existingProfile) {
      return res.status(404).json({
        type: 'error',
        message: 'Profile not found'
      });
    }
    
    // Define allowed fields that can be updated
    const allowedFields = [
      'name',
      'address',
      'address2',
      'country_id',
      'state_id',
      'city_id',
      'zip',
      'aboutme',
      'timeSlots',
      'categories',
      'lat',
      'lng',
      'deliveryRadius'
    ];
    
    // Build update object with only provided fields
    const updateData = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Handle special cases for array fields
        if (field === 'timeSlots' && typeof req.body[field] === 'string') {
          try {
            updateData[field] = JSON.parse(req.body[field]);
          } catch (e) {
            updateData[field] = req.body[field];
          }
        } else if (field === 'categories' && req.body.cats) {
          // Handle category conversion if 'cats' is provided instead of 'categories'
          const user = await User.findById(userId);
          const userRole = user.role || 'retailer';
          
          let categoryList = [];
          if (userRole === 'retailer') {
            categoryList = [
              { id: 1, name: 'Restaurant' },
              { id: 2, name: 'Fast Food' },
              { id: 3, name: 'Bar & Pub' },
              { id: 4, name: 'Cafe & Coffee Shop' },
              { id: 5, name: 'Bakery' },
              { id: 6, name: 'Food Truck' },
              { id: 7, name: 'Catering Service' },
              { id: 8, name: 'Grocery Store' },
              { id: 9, name: 'Other' }
            ];
          } else if (userRole === 'supplier') {
            categoryList = [
              { id: 1, name: 'Meat & Poultry Supplier' },
              { id: 2, name: 'Vegetable & Fruit Producer' },
              { id: 3, name: 'Dairy Products Supplier' },
              { id: 4, name: 'Beverage Distributor' },
              { id: 5, name: 'Bakery Ingredients Supplier' },
              { id: 6, name: 'Seafood Supplier' },
              { id: 7, name: 'Kitchen Equipment Supplier' },
              { id: 8, name: 'Packaging & Disposables' },
              { id: 9, name: 'Other' }
            ];
          }
          
          const cats = Array.isArray(req.body.cats) ? req.body.cats : [req.body.cats];
          updateData[field] = cats.map(catId => {
            const category = categoryList.find(cat => cat.id === parseInt(catId));
            return category ? category.name : catId.toString();
          });
        } else {
          updateData[field] = req.body[field];
        }
      }
    }
    
    // Geocode if address fields are being updated but lat/lng not provided
    if ((updateData.address || updateData.city_id || updateData.state_id || updateData.zip) && 
        !updateData.lat && !updateData.lng) {
      const geocodeResult = await geocodeAddress({
        address: updateData.address || existingProfile.address,
        address2: updateData.address2 || existingProfile.address2,
        city_id: updateData.city_id || existingProfile.city_id,
        state_id: updateData.state_id || existingProfile.state_id,
        country_id: updateData.country_id || existingProfile.country_id,
        zip: updateData.zip || existingProfile.zip
      });
      
      if (geocodeResult.lat && geocodeResult.lng) {
        updateData.lat = geocodeResult.lat;
        updateData.lng = geocodeResult.lng;
      }
    }
    
    // Update the profile with only the provided fields
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: userId },
      { $set: updateData },
      { 
        new: true,
        runValidators: true 
      }
    );
    
    res.status(200).json({
      type: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    res.status(500).json({
      type: 'error',
      message: error.message
    });
  }
};

// @desc    Upload avatar image for user profile
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        type: 'error',
        message: 'No image file provided'
      });
    }
    
    // Find the profile first to ensure it exists
    const existingProfile = await Profile.findOne({ user_id: userId });
    
    if (!existingProfile) {
      return res.status(404).json({
        type: 'error',
        message: 'Profile not found. Please complete your profile first.'
      });
    }
    
    // Upload image using the image upload service
    const uploadResult = await imageUploadService.uploadImage(req.file);
    
    if (!uploadResult.success) {
      return res.status(500).json({
        type: 'error',
        message: 'Failed to upload image'
      });
    }
    
    // Delete old avatar from Cloudinary if it exists
    if (existingProfile.avatarImage) {
      try {
        // Extract public ID from the existing avatar URL
        const urlParts = existingProfile.avatarImage.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = 'pickndeal/' + publicIdWithExtension.split('.')[0];
        
        await imageUploadService.deleteImage(publicId);
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
        // Continue even if deletion fails
      }
    }
    
    // Update profile with new avatar URL
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: userId },
      { $set: { avatarImage: uploadResult.url } },
      { 
        new: true,
        runValidators: true 
      }
    );
    
    res.status(200).json({
      type: 'success',
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: uploadResult.url,
        profile: updatedProfile
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      type: 'error',
      message: error.message || 'Failed to upload avatar'
    });
  }
};

// @desc    Delete avatar image for user profile
// @route   DELETE /api/profile/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the profile
    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        type: 'error',
        message: 'Profile not found'
      });
    }
    
    if (!profile.avatarImage) {
      return res.status(400).json({
        type: 'error',
        message: 'No avatar to delete'
      });
    }
    
    // Delete from Cloudinary
    try {
      const urlParts = profile.avatarImage.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = 'pickndeal/' + publicIdWithExtension.split('.')[0];
      
      await imageUploadService.deleteImage(publicId);
    } catch (deleteError) {
      console.error('Error deleting avatar from Cloudinary:', deleteError);
    }
    
    // Update profile to remove avatar
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: userId },
      { $set: { avatarImage: null } },
      { 
        new: true,
        runValidators: true 
      }
    );
    
    res.status(200).json({
      type: 'success',
      message: 'Avatar deleted successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Avatar deletion error:', error);
    res.status(500).json({
      type: 'error',
      message: error.message || 'Failed to delete avatar'
    });
  }
};
