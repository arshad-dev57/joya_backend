const jwt = require('jsonwebtoken'); // 👈 Make sure this is imported
const User = require('../models/usersmodel');

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

    // ✅ Generate JWT Token
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
    res.status(200).json({
      success: true,
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
