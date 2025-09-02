// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/usersmodel');

exports.protect2 = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support multiple claim keys
    const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload (no id)' });
    }

    const user = await User.findById(userId).select('_id role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // attach minimal context
    req.user = { _id: user._id, role: user.role };

    next();
  } catch (err) {
    console.error('[protect2]', err);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
