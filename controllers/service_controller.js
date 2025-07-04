const Service = require('../models/service');
const cloudinary = require('../config/cloudinary');

exports.createService = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Local file path (multer provides this)
    const localPath = req.file.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'wedding_services'
    });

    console.log(result, title);

    const service = await Service.create({
      title,
      imageUrl: result.secure_url
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('[Service Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('[Get Services Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
