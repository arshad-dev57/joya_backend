const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'wedding_services',
      // ❌ REMOVE allowed_formats to allow all images
      // ✅ OR allow all common image types manually
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg','avif'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;  // ✅ Directly export multer instance
