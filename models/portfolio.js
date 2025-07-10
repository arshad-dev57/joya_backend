const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  serviceType:[String],
  skillsUsed: [String],
  highlights: String,
  challengesFaced: String,
  location: String,
  date: Date,
  duration: String,
  images: [String],
  videoLinks: [String],
  equipmentUsed: [String],
  clientType: String,
  selfNote: String,
  numberOfProjects: {
    type: Number,
    default: 1,
  },
  timeEstimates: {
    minHours: {
      type: Number,
      default: 1,
    },
    maxHours: {
      type: Number,
      default: 10,
    }
  },
  estimatedCostRange: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    }
  },
  isPracticeProject: {
    type: Boolean,
    default: false,
  },
  contactEnabled: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  linkedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
