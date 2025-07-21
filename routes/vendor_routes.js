const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor_controller');
const upload = require('../middlewares/multer'); // Multer config
const { protect } = require('../middlewares/authmiddleware');

router.post(
  '/create',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 }, // Profile image
    { name: 'social_images', maxCount: 10 }, // Multiple social media images
  ]),
  vendorController.createVendor
);
router.get(
  '/getmyvendors',
  protect,
  vendorController.getVendorsByServiceAndCountry
);

router.get('/getallvendors', vendorController.getAllVendors);

router.get(
  '/getdashboardsummary',
  protect,
  vendorController.getDashboardSummary
);

router.put(
  '/update/:id',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'social_images', maxCount: 10 },
  ]),
  vendorController.updateVendor
);

router.post('/linkportfolio', protect, vendorController.linkPortfolioToVendor);
router.get('/getlinkedportfolios/:vendorId', protect, vendorController.getVendorlinkedPortfolios);
module.exports = router;

