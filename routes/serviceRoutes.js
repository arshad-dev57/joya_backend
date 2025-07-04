const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service_controller');
const upload = require('../middlewares/multer');
const { protect } = require('../middlewares/authmiddleware');

// Create service
router.post('/create', protect, upload.single('imageUrl'), serviceController.createService);
router.get('/getservices', serviceController.getAllServices);

module.exports = router;
