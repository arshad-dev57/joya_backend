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
      numberOfProjects,
      timeEstimates,
      estimatedCostRange,
      isPracticeProject,
      contactEnabled
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // ✅ Upload multiple images
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
      serviceType: parseJson(serviceType),
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
      numberOfProjects: numberOfProjects ? Number(numberOfProjects) : 1,
      timeEstimates: parseJsonOrObject(timeEstimates, {
        minHours: 1,
        maxHours: 10
      }),
      estimatedCostRange: parseJsonOrObject(estimatedCostRange, {
        min: 0,
        max: 0,
        currency: 'USD'
      }),
      isPracticeProject: isPracticeProject === 'true',
      contactEnabled: contactEnabled !== 'false',
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

// ✅ Helper to safely parse JSON arrays
function parseJson(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ✅ Helper to safely parse JSON objects
function parseJsonOrObject(value, defaultValue) {
  if (!value) return defaultValue;
  try {
    if (typeof value === 'object') return value;
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

exports.getUserPortfolios = async (req, res) => {
  try {
    const userId = req.user._id;
    const serviceType = req.query.serviceType;

    let filter = { createdBy: userId };

    if (serviceType) {
      // Partial, case-insensitive match inside array of serviceType strings
      filter.serviceType = {
        $elemMatch: {
          $regex: serviceType,
          $options: 'i'
        }
      };
    }

    console.log("[DEBUG] Portfolio Filter:", JSON.stringify(filter, null, 2));

    const portfolios = await Portfolio.find(filter).sort({ createdAt: -1 });

    if (!portfolios.length) {
      return res.status(404).json({
        success: false,
        message: serviceType
          ? `No portfolios found for service type: ${serviceType}`
          : "No portfolios found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error) {
    console.error('[Get User Portfolios Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


exports.getAllPortfoliosOfLoggedInUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const portfolios = await Portfolio.find({ createdBy: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error) {
    console.error('[Get All User Portfolios Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
