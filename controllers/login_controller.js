const User = require('../models/usersmodel');
const Vendor = require('../models/vendor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginValue = email?.trim().toLowerCase();

    let user = null;
    let userType = 'user';

    // Try finding user by email first
    user = await User.findOne({ email: loginValue }).select('+password');

    if (!user) {
      // If not found by email, try finding by username (case insensitive)
      user = await User.findOne({ username: loginValue }).select('+password');
    }

    if (!user) {
      // Check in Vendor model as well (by email only)
      user = await Vendor.findOne({ email: loginValue }).select('+password');
      userType = 'vendor';
    }

    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const payload = {
      userId: user._id,
      role: user.role || userType
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || userType,
        country: user.country,
      }
    });

  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
