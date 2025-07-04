const Portfolio = require('../models/portfolio');
const cloudinary = require('../config/cloudinary');

exports.createPortfolio = async (req, res) => {
  try {
    console.log('REQ.BODY:', req.body);
    console.log('REQ.FILES:', req.files);

    const { title, description, services } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'portfolio'
        });
        uploadedImages.push(result.secure_url);
      }
    }

    let parsedServices = [];
    if (services) {
      try {
        parsedServices = JSON.parse(services);
        if (!Array.isArray(parsedServices)) {
          return res.status(400).json({
            success: false,
            message: 'Services must be an array'
          });
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid services format. Must be a JSON array.',
        });
      }
    }

    const portfolio = await Portfolio.create({
      title,
      description,
      images: uploadedImages,
      services: parsedServices,
      createdBy: req.user._id
    });

    console.log(portfolio);

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('[Portfolio Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};


exports.getUserPortfolios = async (req, res) => {
  try {
    const userId = req.user._id;

    const portfolios = await Portfolio.find({ createdBy: userId }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    console.error('[Get User Portfolios Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
