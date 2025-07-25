const PaymentLink = require('../models/payment');
const cloudinary = require('../config/cloudinary');
exports.createpaymentlink = async (req, res) => {
  try {
    const { link } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'paymentlink'
    });

    const paymentlink = await PaymentLink.create({
      link,
      imageUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: 'Payment link created successfully',
      data: paymentlink
    });

  } catch (error) {
    console.error('[Payment Link Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllPaymentLinks = async (req, res) => {
  try {
    const paymentlinks = await PaymentLink.find();
    res.status(200).json({
      success: true,
      count: paymentlinks.length,
      data: paymentlinks
    });
  } catch (error) {
    console.error('[Get Payment Links Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.createpaymentlink = async (req, res) => {
  try {
    const { link } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'paymentlink'
    });

    const paymentlink = await PaymentLink.create({
      link,
      imageUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: 'Payment link created successfully',
      data: paymentlink
    });

  } catch (error) {
    console.error('[Payment Link Create Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deletePaymentLink = async (req, res) => {
  try {
    const linkId = req.params.id;

    const link = await PaymentLink.findById(linkId);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found',
      });
    }


    await PaymentLink.findByIdAndDelete(linkId);

    res.status(200).json({
      success: true,
      message: 'Payment link deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Payment Link Error]', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
