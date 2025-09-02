const Service = require('../models/service');
const cloudinary = require('../config/cloudinary');
const Vendor = require('../models/vendor');
exports.createService = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    // CloudinaryStorage via multer already uploaded the file
    const imageUrl = req.file.path; // ✅ this is already a Cloudinary URL

    console.log("Image uploaded to Cloudinary:", imageUrl);
    console.log("Title:", title);

    const service = await Service.create({
      title,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('[Service Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /services/withCounts?country=UAE
exports.getServicesWithCounts = async (req, res) => {
  try {
    const { country } = req.query;

    // 1) Get all service titles
    const services = await Service.find({}, { title: 1, imageUrl: 1, createdAt: 1 }).sort({ createdAt: -1 }).lean();
    const titles = services.map(s => s.title);

    // 2) Aggregate vendor counts grouped by service title
    const match = { services: { $in: titles } };
    if (country && country.trim()) match.country = country.trim();

    const counts = await Vendor.aggregate([
      { $match: match },
      { $unwind: '$services' },
      { $match: { services: { $in: titles } } },
      { $group: { _id: '$services', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map(c => [c._id, c.count]));

    const payload = services.map(s => ({
      _id: s._id,
      title: s.title,
      imageUrl: s.imageUrl,
      createdAt: s.createdAt,
      vendorCount: countMap.get(s.title) || 0,
    }));

    return res.status(200).json({ success: true, count: payload.length, data: payload });
  } catch (err) {
    console.error('[Get Services With Counts Error]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('[Service Delete Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
