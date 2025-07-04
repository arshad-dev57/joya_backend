const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: false,
    trim: true
  },
  country: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  services: [
    {
      type: String,
      required: false,
      trim: true
    }
  ],
  url: [
    {
      name: { type: String, required: false },
      url: { type: String, required: false },
      image: { type: String, required: false }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
