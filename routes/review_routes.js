const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review_controller');
const { protect } = require('../middlewares/authmiddleware');

// Create review
router.post('/create', protect, reviewController.addReview);

// Get vendor reviews
router.get('/:vendorId', reviewController.getVendorReviews);

module.exports = router;
