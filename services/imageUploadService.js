const { cloudinary } = require('../config/cloudinary');

class ImageUploadService {
  async uploadImage(file) {
    try {
      if (!file || !file.path) {
        throw new Error('No file provided for upload');
      }

      return {
        success: true,
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format || file.mimetype
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async uploadMultipleImages(files) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided for upload');
      }

      const uploadResults = files.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format || file.mimetype
      }));

      return {
        success: true,
        images: uploadResults,
        count: uploadResults.length
      };
    } catch (error) {
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  async uploadBase64Image(base64String, folder = 'pickndeal') {
    try {
      if (!base64String) {
        throw new Error('No base64 string provided');
      }

      const result = await cloudinary.uploader.upload(base64String, {
        folder: folder,
        resource_type: 'auto'
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes
      };
    } catch (error) {
      throw new Error(`Base64 image upload failed: ${error.message}`);
    }
  }

  async deleteImage(publicId) {
    try {
      if (!publicId) {
        throw new Error('No public ID provided for deletion');
      }

      const result = await cloudinary.uploader.destroy(publicId);

      return {
        success: result.result === 'ok',
        publicId: publicId,
        result: result.result
      };
    } catch (error) {
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  async deleteMultipleImages(publicIds) {
    try {
      if (!publicIds || publicIds.length === 0) {
        throw new Error('No public IDs provided for deletion');
      }

      const deletePromises = publicIds.map(publicId => 
        cloudinary.uploader.destroy(publicId)
      );

      const results = await Promise.all(deletePromises);

      const successfulDeletions = results.filter(r => r.result === 'ok').length;

      return {
        success: true,
        totalDeleted: successfulDeletions,
        totalRequested: publicIds.length,
        results: results
      };
    } catch (error) {
      throw new Error(`Multiple image deletion failed: ${error.message}`);
    }
  }

  async getImageDetails(publicId) {
    try {
      if (!publicId) {
        throw new Error('No public ID provided');
      }

      const result = await cloudinary.api.resource(publicId);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        createdAt: result.created_at,
        tags: result.tags
      };
    } catch (error) {
      throw new Error(`Failed to get image details: ${error.message}`);
    }
  }

  async updateImage(publicId, updates) {
    try {
      if (!publicId) {
        throw new Error('No public ID provided');
      }

      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        ...updates
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        updatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Image update failed: ${error.message}`);
    }
  }

  generateTransformationUrl(publicId, transformations) {
    try {
      if (!publicId) {
        throw new Error('No public ID provided');
      }

      const url = cloudinary.url(publicId, transformations);

      return {
        success: true,
        url: url,
        publicId: publicId,
        transformations: transformations
      };
    } catch (error) {
      throw new Error(`Failed to generate transformation URL: ${error.message}`);
    }
  }
}

module.exports = new ImageUploadService();