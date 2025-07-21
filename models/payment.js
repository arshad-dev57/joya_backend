const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PaymentLink = mongoose.model('paymentlink', serviceSchema);

module.exports = PaymentLink;
