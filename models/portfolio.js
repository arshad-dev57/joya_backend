const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  serviceType: String, 
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
  ratings: Number, 
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
