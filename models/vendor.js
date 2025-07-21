// models/vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  phone_number: String,
  code: String,
  country: String,
  description: String,
  paymentlink  :String,
  image: String,
  services: [String],
  url: [{
    name: String,
    url: String,
    image: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  password: {
    type: String,
    required: true,
    select: false
  },
  linkedPortfolios: {
    type: [mongoose.Schema.Types.Mixed], // to hold full object
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
