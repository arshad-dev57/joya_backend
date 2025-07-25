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

    // First check in User model
    user = await User.findOne({ email: loginValue }).select('+password');

    if (!user) {
      user = await User.findOne({ username: loginValue }).select('+password');
    }

    // Then check in Vendor model
    if (!user) {
      user = await Vendor.findOne({ email: loginValue }).select('+password');
      if (user) userType = 'vendor';
    }

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

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role || userType,
        country: user.country || null,
        image: user.image || null
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
