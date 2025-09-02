// routes/simpleSettingsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settings_controller');

// Payment Link
router.get('/payment-link', ctrl.getPaymentLink);
router.put('/payment-link', ctrl.updatePaymentLink);

// Disclaimer
router.get('/disclaimer', ctrl.getDisclaimer);
router.put('/disclaimer', ctrl.updateDisclaimer);

module.exports = router;
