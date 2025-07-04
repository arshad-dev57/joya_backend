const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ya Vendor model agar separate hai
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


exports.getVendorReviews = async (req, res) => {
    try {
      const vendorId = req.params.vendorId;
  
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: "vendorId is required",
        });
      }
  
      const reviews = await Review.find({ vendorId })
        .populate('userId', 'firstname lastname email') // Agar user ke details bhi dikhani hain
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      console.error('[Get Vendor Reviews Error]', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  