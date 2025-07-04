const Upload = require('../models/add');
const cloudinary = require('../config/cloudinary');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'single_uploads'
    });

    // Save URL to DB (optional)
    const upload = await Upload.create({
      imageUrl: result.secure_url,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: upload
    });

  } catch (error) {
    console.error('[Image Upload Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllUploads = async (req, res) => {
    try {
      const uploads = await Upload.find().populate('uploadedBy', 'username email');
  
      res.status(200).json({
        success: true,
        count: uploads.length,
        data: uploads
      });
    } catch (error) {
      console.error('[Get Uploads Error]', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };