const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Uploads an image to Cloudinary
 * @param {string} filePath - Path to the temporary file
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'products') => {
  try {
    console.log(`Attempting to upload file from path: ${filePath} to Cloudinary folder: ${folder}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });
    
    console.log(`Successfully uploaded to Cloudinary. Public ID: ${result.public_id}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted temporary file at: ${filePath}`);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error(`Cloudinary upload error: ${error.message}`);
    
    if (error.http_code) {
      console.error(`Cloudinary HTTP Status: ${error.http_code}`);
    }
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted temporary file at: ${filePath} after error`);
      } catch (e) {
        console.error(`Failed to delete temporary file: ${e.message}`);
      }
    }
    
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

/**
 * @param {string} publicId 
 * @returns {Promise<Object>} 
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return { result: 'No public ID provided' };
    
    console.log(`Attempting to delete image with public ID: ${publicId} from Cloudinary`);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deletion result: ${JSON.stringify(result)}`);
    
    return result;
  } catch (error) {
    console.error(`Cloudinary deletion error: ${error.message}`);
    throw new Error(`Error deleting from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
}; 