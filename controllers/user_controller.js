// controllers/user.controller.js
'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/usersmodel');     // your user model (updated with status/tokenVersion)
const Vendor = require('../models/vendor');
const Ad = require('../models/add');
const Service = require('../models/service');
const PaymentLink = require('../models/payment');
const cloudinary = require('../config/cloudinary');

const norm = (s) => (s || '').toString().trim();
const lower = (s) => norm(s).toLowerCase();

function issueJwt(user) {
  // include tokenVersion (v) so we can revoke all old tokens by bumping it
  const payload = { sub: user._id.toString(), role: user.role, v: user.tokenVersion };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

exports.signup = async (req, res) => {
  try {
    const {
      username, email, country, language, role,
      firstname, lastname, password, phone
    } = req.body;

    const cleanUsername = norm(username);
    const cleanEmail = lower(email);
    const cleanPhone = norm(phone);

    if (!cleanUsername || !cleanEmail || !password || !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Username, email, phone, and password are required.' });
    }

    const existingUsername = await User.findOne({ username: new RegExp(`^${cleanUsername}$`, 'i') });
    if (existingUsername) return res.status(409).json({ success: false, message: 'User already exists with this username' });

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return res.status(409).json({ success: false, message: 'User already exists with this email' });

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) return res.status(409).json({ success: false, message: 'User already exists with this phone number' });

    const user = new User({
      username: cleanUsername,
      email: cleanEmail,
      country,
      language,
      role,
      firstname,
      lastname,
      password,       
      phone: cleanPhone,
      status: 'active', 
    });

    await user.save();

    const token = issueJwt(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        country: user.country,
        language: user.language,
        role: user.role,
        status: user.status,
        paymentStatus: user.paymentStatus,
        image: user.image,
      }
    });
  } catch (error) {
    console.error('[Signup Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
    }

    const q = lower(emailOrUsername);
    const user = await User.findOne({
      $or: [{ email: q }, { username: new RegExp(`^${norm(emailOrUsername)}$`, 'i') }]
    }).select('+password status role tokenVersion email username language country paymentStatus image');

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, code: 'ACCOUNT_INACTIVE', message: 'Account is inactive' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = issueJwt(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        country: user.country,
        language: user.language,
        role: user.role,
        status: user.status,
        paymentStatus: user.paymentStatus,
        image: user.image,
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    // stateless JWT; nothing to do server-side for single logout
    res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    console.error('[Logout Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const userId = req.user?.id; // needs auth middleware
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    console.error('[LogoutAll Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required.' });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: { id: deletedUser._id, username: deletedUser.username, email: deletedUser.email }
    });
  } catch (error) {
    console.error('[Delete User Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      { new: true, projection: { password: 0 } }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'Payment status updated successfully', data: updatedUser });
  } catch (error) {
    console.error('[Update Payment Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateUserImage = async (req, res) => {
  try {
    const userId = req.params.id;
    const file = req.file;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required.' });
    if (!file || !file.path) return res.status(400).json({ success: false, message: 'Image file is required.' });

    const result = await cloudinary.uploader.upload(file.path);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: result.secure_url },
      { new: true, projection: { password: 0 } }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User image updated successfully', data: updatedUser });
  } catch (error) {
    console.error('[Update User Image Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const update = {
      status,
      deactivatedAt: (status === 'inactive' || status === 'suspended') ? new Date() : null,
      deactivatedBy: (status === 'inactive' || status === 'suspended') ? (req.user?.id || null) : null,
      deactivationReason: (status === 'inactive' || status === 'suspended') ? (reason || '') : '',
    };

    const updated = await User.findOneAndUpdate(
      { _id: id },
      { $set: update, $inc: { tokenVersion: 1 } }, // bump tokenVersion -> revoke all sessions
      { new: true, projection: { password: 0 } }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    if ((status === 'inactive' || status === 'suspended') && updated.role === 'vendor') {
      try {
        await Promise.all([
          Service.updateMany({ vendorId: id }, { $set: { isPublished: false } }),
          Ad.updateMany({ vendorId: id }, { $set: { isPublished: false } }),
        ]);
      } catch (subErr) {
        console.warn('[SetUserStatus] Vendor content hide warning:', subErr.message);
      }
    }

    res.status(200).json({ success: true, message: `User ${status}`, data: updated });
  } catch (error) {
    console.error('[SetUserStatus Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// (Optional) get single user profile by id

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[GetUserById Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
