const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor_controller');
const parser = require('../middlewares/multer'); // multer setup
const { protect } = require('../middlewares/authmiddleware');

// UPDATED: Add multer fields middleware here
router.post(
  '/create',
  protect,
  parser.fields([
    { name: 'image', maxCount: 1 }, // for main profile image
    { name: 'social_images', maxCount: 10 }, // for social icons
  ]),
  vendorController.createVendor,
);

router.get('/getmyvendors', protect, vendorController.getVendorsByServiceAndCountry);
router.get('/getallvendors', vendorController.getAllVendors);
router.get('/getdashboardsummary', protect, vendorController.getDashboardSummary);

module.exports = router;
