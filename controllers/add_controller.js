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

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'single_uploads'
    });

    const upload = await Upload.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,         
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

// ✅ NEW DELETE CONTROLLER
exports.deleteUpload = async (req, res) => {
  try {
    const uploadId = req.params.id;

    // Find the upload record
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Delete from Cloudinary using public_id
    if (upload.publicId) {
      await cloudinary.uploader.destroy(upload.publicId);
    }

    // Delete from MongoDB
    await Upload.findByIdAndDelete(uploadId);

    res.status(200).json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Upload Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
