const Vendor = require('../models/vendor');
const cloudinary = require('../config/cloudinary');
const Portfolio = require('../models/portfolio');
const bcrypt = require('bcrypt');

const User = require('../models/usersmodel'); // Make sure it's imported

const { protect } = require('../middlewares/authmiddleware');


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
      services,
      paymentlink,
      password,
    } = req.body;

    // ---- sanitize helpers ----
    const s = v => (typeof v === 'string' ? v.trim() : '');

    const cleanEmail    = s(email).toLowerCase();
    const cleanUsername = s(username);
    const cleanPhone    = s(phone_number);
    const cleanFirst    = s(firstname);
    const cleanLast     = s(lastname);
    const cleanCode     = s(code);
    const cleanCountry  = s(country);
    const cleanDesc     = s(description);
    const cleanPayLink  = s(paymentlink);

    // ---- check duplicate vendor ----
    const orClauses = [];
    if (cleanEmail)    orClauses.push({ email: cleanEmail });
    if (cleanUsername) orClauses.push({ username: cleanUsername });
    if (cleanPhone)    orClauses.push({ phone_number: cleanPhone });

    const existingVendor = orClauses.length
      ? await Vendor.findOne({ $or: orClauses })
      : null;

    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'Vendor already exists' });
    }

    // ---- main image upload ----
    let imageUrl = '';
    if (req.files?.image?.[0]) {
      const uploadResult = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: 'vendors/main_images' }
      );
      imageUrl = uploadResult?.secure_url || '';
    }

    // ---- parse social urls ----
    let parsedUrls = [];
    if (url) {
      try {
        parsedUrls = typeof url === 'string' ? JSON.parse(url) : url;
        if (!Array.isArray(parsedUrls)) parsedUrls = [];
      } catch {
        parsedUrls = [];
      }
    }

    // ---- attach social images ----
    const socialImages = req.files?.social_images || [];
    for (let i = 0; i < socialImages.length; i++) {
      const file = socialImages[i];
      const uploadResult = await cloudinary.uploader.upload(
        file.path,
        { folder: 'vendors/social_icons' }
      );
      const iconUrl = uploadResult?.secure_url || '';
      if (parsedUrls[i]) {
        parsedUrls[i].image = iconUrl;
        parsedUrls[i].name = s(parsedUrls[i].name);
        parsedUrls[i].url  = s(parsedUrls[i].url);
      } else {
        parsedUrls.push({ name: '', url: '', image: iconUrl });
      }
    }

    // ---- parse services ----
    let parsedServices = [];
    if (services) {
      try {
        parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
        if (!Array.isArray(parsedServices)) parsedServices = [];
        parsedServices = parsedServices.map(svc => s(svc)).filter(Boolean);
      } catch {
        parsedServices = [];
      }
    }

    // ---- check auth ----
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Missing user info.' });
    }

    const hashedPassword = await bcrypt.hash(String(password ?? ''), 10);

    const vendorPayload = {

      firstname   : cleanFirst,
      lastname    : cleanLast,
      username    : cleanUsername,
      email       : cleanEmail,
      phone_number: cleanPhone,
      code        : cleanCode,
      country     : cleanCountry,
      description : cleanDesc,
      paymentlink : cleanPayLink,
      image       : imageUrl,
      services    : parsedServices,
      url         : parsedUrls,
      password    : hashedPassword,
      createdBy   : req.user._id,  
      vendorId    : req.user._id,
    };

    const vendor = await Vendor.create(vendorPayload);

    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    });

  } catch (error) {
    console.error('[Vendor Create Error]', error);
    return res.status(500).json({
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
exports.getVendorsByServiceAndCountry = async (req, res) => {
  try {
    const { service, country } = req.query;

    const query = {};
    if (service) query.services = service;
    if (country) query.country = country;

    const vendors = await Vendor.find(query);

    res.status(200).json({
      success: true,
      message: 'Filtered vendors fetched successfully',
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error('[getVendorsByServiceAndCountry Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};




exports.updateVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
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

    console.log("[UPDATE] Incoming Fields:", req.body);
    console.log("[UPDATE] Incoming Files:", Object.keys(req.files || {}));

    let vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    let imageUrl = vendor.image;

    // ✅ Upload new main image if exists
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
      console.log("[Cloudinary] No new main image uploaded.");
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

    // ✅ Upload new social images
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

    // ✅ Parse services
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

    // ✅ Update vendor fields
    vendor.firstname = firstname ?? vendor.firstname;
    vendor.lastname = lastname ?? vendor.lastname;
    vendor.username = username ?? vendor.username;
    vendor.email = email ?? vendor.email;
    vendor.phone_number = phone_number ?? vendor.phone_number;
    vendor.code = code ?? vendor.code;
    vendor.country = country ?? vendor.country;
    vendor.description = description ?? vendor.description;
    vendor.image = imageUrl ?? vendor.image;
    vendor.url = parsedUrls.length ? parsedUrls : vendor.url;
    vendor.services = parsedServices.length ? parsedServices : vendor.services;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });

  } catch (error) {
    console.error("[Vendor Update Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.linkPortfolioToVendor = async (req, res) => {
  try {
    const { portfolioId, vendorId } = req.body;

    if (!portfolioId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: "portfolioId aur vendorId dono required hain.",
      });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor nahi mila.",
      });
    }

    const portfolioDoc = await Portfolio.findById(portfolioId);
    if (!portfolioDoc) {
      return res.status(404).json({
        success: false,
        message: "Portfolio nahi mila.",
      });
    }

    // ✅ Link vendor ID in portfolio
    portfolioDoc.linkedVendor = vendorId;
    await portfolioDoc.save();

    // Convert portfolio to plain object
    const portfolio = portfolioDoc.toObject();

    // ✅ Check if already linked
    const isAlreadyLinked = vendor.linkedPortfolios.some(p => 
      p._id.toString() === portfolio._id.toString()
    );

    if (!isAlreadyLinked) {
      vendor.linkedPortfolios.push(portfolio);
      await vendor.save();
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio successfully vendor ke sath embed hogaya.",
      data: vendor.linkedPortfolios
    });

  } catch (error) {
    console.error("[Link Portfolio Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


exports.getVendorlinkedPortfolios = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const portfolios = await Portfolio.find({
      linkedVendor: vendorId,
    }).sort({ createdAt: -1 });

    if (!portfolios || portfolios.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No linked portfolios found for this vendor.",
      });
    }

    return res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });

  } catch (error) {
    console.error("[Get Linked Portfolios Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};