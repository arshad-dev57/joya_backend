const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service_controller');
const upload = require('../middlewares/multer');
const { protect } = require('../middlewares/authmiddleware');

// Create service
router.post('/createservice', protect, upload.single('imageUrl'), serviceController.createService);
router.get('/getservices', serviceController.getServicesWithCounts);
router.delete('/deleteservice/:id', protect, serviceController.deleteService);

module.exports = router;
