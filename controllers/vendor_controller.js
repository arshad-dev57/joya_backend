const Vendor = require('../models/Vendor');
const cloudinary = require('../config/cloudinary');

exports.createVendor = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      phone_number,
      code,
      country,
      description,
      url,
      services
    } = req.body;

    console.log("[DEBUG] Incoming Fields:", req.body);
    console.log("[DEBUG] Incoming Files:", Object.keys(req.files || {}));

    let imageUrl = null;

    // ✅ Upload main image if exists
    if (req.files?.image?.[0]) {
      const uploadResult = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: "vendors/main_images",
        }
      );
      imageUrl = uploadResult.secure_url;
      console.log("[Cloudinary] Main image uploaded:", imageUrl);
    } else {
      console.log("[Cloudinary] No main image uploaded.");
    }

    // ✅ Parse `url` (social links)
    let parsedUrls = [];
    if (url) {
      try {
        parsedUrls = typeof url === 'string' ? JSON.parse(url) : url;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format. Must be JSON array.',
        });
      }
    }

    // ✅ Upload each social image to Cloudinary
    const socialImages = req.files?.social_images || [];
    for (let i = 0; i < socialImages.length; i++) {
      const file = socialImages[i];

      const uploadResult = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "vendors/social_icons",
        }
      );

      if (parsedUrls[i]) {
        parsedUrls[i].image = uploadResult.secure_url;
        console.log(`[Cloudinary] Social icon #${i} uploaded:`, parsedUrls[i].image);
      }
    }

    // ✅ Parse `services` field
    let parsedServices = [];
    if (services) {
      try {
        parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid services format. Should be JSON array.',
        });
      }
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Missing user info.',
      });
    }

    const vendor = await Vendor.create({
      firstname,
      lastname,
      username,
      email,
      phone_number,
      code,
      country,
      description,
      image: imageUrl,
      url: parsedUrls,
      services: parsedServices,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    });

  } catch (error) {
    console.error('[Vendor Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};


exports.getAllVendors = async (req, res) => {
  try {
    console.log("Fetching vendors...");
    const vendors = await Vendor.find(); 
    console.log("Vendors fetched:", vendors.length);
    res.status(200).json({
      success: true,
      message: 'Vendors fetched successfully',
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('[Get All Vendors Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    // const vendorsCount = await Vendor.countDocuments();
    // const adsCount = await Ad.countDocuments();
    // const servicesCount = await Service.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data: {
        usersCount,
        // vendorsCount,
        // adsCount,
        // servicesCount,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
