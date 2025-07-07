const Vendor = require('../models/vendor');

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

    let imageUrl = null;

    if (req.file) {
      // Multer Cloudinary returns URL directly
      imageUrl = req.file.path || req.file.secure_url || req.file.url;
    }

    // ✅ Safe handling of url field
    let parsedUrls = [];

    if (url) {
      if (typeof url === 'string') {
        try {
          parsedUrls = JSON.parse(url);
        } catch (err) {
          console.error('[URL Parse Error]', err);
          return res.status(400).json({
            success: false,
            message: 'Invalid URL format. Should be a JSON array of objects.'
          });
        }
      } else if (Array.isArray(url)) {
        parsedUrls = url;
      } else {
        return res.status(400).json({
          success: false,
          message: 'URL field must be an array or JSON string.'
        });
      }
    }

    // ✅ Safe handling of services field
    let parsedServices = [];

    if (services) {
      if (typeof services === 'string') {
        try {
          parsedServices = JSON.parse(services);
        } catch (err) {
          console.error('[Services Parse Error]', err);
          return res.status(400).json({
            success: false,
            message: 'Invalid services format. Should be a JSON array.'
          });
        }
      } else if (Array.isArray(services)) {
        parsedServices = services;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Services field must be an array or JSON string.'
        });
      }
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
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });

  } catch (error) {
    console.error('[Vendor Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getVendorsByServiceAndCountry = async (req, res) => {
  try {
    const { service, country } = req.query;

    if (!service || !country) {
      return res.status(400).json({
        success: false,
        message: "Both service and country are required fields."
      });
    }

    const vendors = await Vendor.find({
      services: { $in: [service] },
      country: country
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('[Get Vendors Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
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
