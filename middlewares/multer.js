const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'wedding_services',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg','avif'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    };
  },
});

const upload = multer({
  storage,
  
});

module.exports = upload;
