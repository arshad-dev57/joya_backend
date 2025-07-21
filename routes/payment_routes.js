const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer'); // your multer config
const paymentController = require('../controllers/payment_controller');

router.post('/create', upload.single('imageUrl'), paymentController.createpaymentlink);
router.get('/getpaymentlinks', paymentController.getAllPaymentLinks);
router.delete('/delete/:id', paymentController.deletePaymentLink);

module.exports = router;
