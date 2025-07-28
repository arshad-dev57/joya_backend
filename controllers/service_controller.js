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


exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    // Har service ke liye vendor count nikalo
    const servicesWithVendorCount = await Promise.all(
      services.map(async (service) => {
        const count = await Vendor.countDocuments({
          services: service.title
        });

        return {
          _id: service._id,
          title: service.title,
          imageUrl: service.imageUrl,
          createdAt: service.createdAt,
          vendorCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      count: servicesWithVendorCount.length,
      data: servicesWithVendorCount
    });
  } catch (error) {
    console.error('[Get Services Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
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
