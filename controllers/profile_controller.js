// controllers/users.js
const User = require('../models/usersmodel');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id; // jo bhi aa raha ho
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // password by default select:false hai—yahan explicitly select useful fields
    const user = await User.findById(userId)
      .select('firstname lastname email role paymentStatus phone image');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
        email: user.email,
        role: user.role,
        paymentStatus: user.paymentStatus,
        phone: user.phone ?? null,
        image: user.image ?? null,
      },
    });
  } catch (error) {
    console.error('[Profile Error]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
