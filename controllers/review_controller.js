const Review = require('../models/reviews');
const Vendor = require('../models/vendor');


exports.addReview = async (req, res) => {
  try {
    const { vendorId, comment, rating } = req.body;
    const userId = req.user._id;

    if (!vendorId || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: 'vendorId, comment and rating are required'
      });
    }

    const review = await Review.create({
      vendorId,
      userId,
      comment,
      rating
    });
        const populatedReview = await Review.findById(review._id).populate('userId', 'email');
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: populatedReview
    });

  } catch (error) {
    console.error('[Add Review Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getVendorReviews = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    const reviews = await Review.find({ vendorId }).populate('userId', 'firstname lastname email');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('[Get Vendor Reviews Error]', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
