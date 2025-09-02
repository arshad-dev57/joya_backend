const { body } = require('express-validator');

exports.updateSettingsValidator = [
  body('paymentLink')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('paymentLink must be a valid http/https URL'),
  body('disclaimer.enabled')
    .optional()
    .isBoolean().withMessage('disclaimer.enabled must be boolean')
    .toBoolean(),
  body('disclaimer.title')
    .optional()
    .isLength({ max: 120 }).withMessage('title max 120 chars'),
  body('disclaimer.body')
    .optional()
    .isLength({ max: 5000 }).withMessage('body max 5000 chars'),
];
