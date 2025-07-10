const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/add_controller');
const { protect } = require('../middlewares/authmiddleware');
const upload = require('../middlewares/multer');

// Single image upload route
router.post(
  '/createads',
  protect,
  upload.single('image'),
  uploadController.uploadImage
);

router.get(
    '/getads',
    protect,
    uploadController.getAllUploads
  );

router.delete(
    '/delete/:id',
    protect,
    uploadController.deleteUpload
  );

module.exports = router;
