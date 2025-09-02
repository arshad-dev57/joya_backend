// middleware/protect.js
const jwt = require('jsonwebtoken');
const User = require('../models/usersmodel');

async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ success:false, message:'Unauthorized: No token' });
    }
    const token = auth.slice(7);

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success:false, message:'Unauthorized: Invalid token' });
    }

    // 🔑 backward-compat
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) {
      return res.status(401).json({ success:false, message:'Unauthorized: Bad token payload' });
    }

    const user = await User.findById(userId).select('status role tokenVersion');
    if (!user) return res.status(401).json({ success:false, message:'Unauthorized: User not found' });

    if (user.status !== 'active') {
      return res.status(403).json({ success:false, code:'ACCOUNT_INACTIVE', message:'Account is inactive' });
    }

    // 🔑 default token version = 0 if not provided
    const tokenV = (typeof payload.v === 'number') ? payload.v : 0;
    const userV  = typeof user.tokenVersion === 'number' ? user.tokenVersion : 0;

    if (tokenV !== userV) {
      return res.status(401).json({ success:false, message:'Session expired' });
    }

    req.user = { id: user._id.toString(), role: user.role, status: user.status };
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message:'Unauthorized' });
  }
}

module.exports = { protect };
