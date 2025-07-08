const Portfolio = require('../models/portfolio');
const cloudinary = require('../config/cloudinary');

exports.createPortfolio = async (req, res) => {
  try {
    const {
      title,
      description,
      serviceType,
      skillsUsed,
      highlights,
      challengesFaced,
      location,
      date,
      duration,
      videoLinks,
      equipmentUsed,
      clientType,
      selfNote,
      ratings,
      isPracticeProject,
      contactEnabled
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Upload multiple images
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'portfolio'
        });
        uploadedImages.push(result.secure_url);
      }
    }

    const portfolio = await Portfolio.create({
      title,
      description,
      serviceType,
      skillsUsed: parseJson(skillsUsed),
      highlights,
      challengesFaced,
      location,
      date,
      duration,
      images: uploadedImages,
      videoLinks: parseJson(videoLinks),
      equipmentUsed: parseJson(equipmentUsed),
      clientType,
      selfNote,
      ratings: ratings ? Number(ratings) : undefined,
      isPracticeProject: isPracticeProject === 'true',
      contactEnabled: contactEnabled !== 'false', // default true
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('[Create Portfolio Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper to safely parse array strings from JSON
function parseJson(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}// controller/portfolioController.js

exports.getUserPortfolios = async (req, res) => {
  try {
    const userId = req.user._id;
    const serviceType = req.query.serviceType; 

    let filter = { createdBy: userId };

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    const portfolios = await Portfolio.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error) {
    console.error('[Get User Portfolios Error]', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
