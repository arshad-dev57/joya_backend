const jwt = require('jsonwebtoken'); // 👈 Make sure this is imported
const User = require('../models/usersmodel');
const Vendor = require('../models/vendor');
const Ad = require('../models/add');
const Service = require('../models/service');
const PaymentLink = require('../models/payment');
exports.signup = async (req, res) => {
  try {
    const {
      username,
      email,
      country,
      language,
      role,
      firstname,
      lastname,
      password,
      phone
    } = req.body;
    const cleanUsername = username?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone?.trim();

    if (!cleanUsername || !cleanEmail || !password || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, phone, and password are required.'
      });
    }

    const existingUsername = await User.findOne({
      username: new RegExp(`^${cleanUsername}$`, 'i')
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this username'
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    const user = new User({
      username: cleanUsername,
      email: cleanEmail,
      country,
      language,
      role,
      firstname,
      lastname,
      password,       
      phone: cleanPhone
    });

    await user.save();
    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        country: user.country,
        role: user.role,
        country: user.country
      }
    });

  } catch (error) {
    console.error('[Signup Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    console.error('[Logout Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    const vendors = await Vendor.find().select('-password');
    const services = await Service.find().select('-password');
    const ads = await Ad.find().select('-password');
    const paymentlinks = await PaymentLink.find().select('-password');
    res.status(200).json({
      success: true,
      usercount: users.length,
      vendorcount: vendors.length,
      servicescount: services.length,
      adcount: ads.length,
      paymentlinkcount: paymentlinks.length,
      message: 'Users fetched successfully',
      data: users
    });
  } catch (error) {
    console.error('[Get Users Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: {
        id: deletedUser._id,
        username: deletedUser.username,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error('[Delete User Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


exports.updatePaymentStatus = async (req, res) => {
  try {
    const { userId, paymentStatus } = req.body;

    if (!userId || !['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'User ID and valid payment status (paid/unpaid) are required.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { paymentStatus },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('[Update Payment Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
