const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor_controller');
const parser = require('../middlewares/multer');
const { protect } = require('../middlewares/authmiddleware');

router.post('/create', protect, parser.single('image'), vendorController.createVendor);
router.get('/getmyvendors', protect, vendorController.getVendorsByServiceAndCountry);
router.get('/getallvendors', vendorController.getAllVendors);
module.exports = router;
