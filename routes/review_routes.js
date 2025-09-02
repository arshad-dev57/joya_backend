const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review_controller');
const { protect } = require('../middlewares/authmiddleware');
const { protect2 } = require('../middlewares/oldauthmiddleware');
// Create review
router.post('/create', protect2, reviewController.addReview);

// Get vendor reviews
router.get('/:vendorId', reviewController.getVendorReviews);

module.exports = router;
