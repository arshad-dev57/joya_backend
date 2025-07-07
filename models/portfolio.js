const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  serviceType: String, // e.g., Makeup, Photography
  skillsUsed: [String], // e.g., ["Contouring", "HD Makeup"]
  highlights: String,
  challengesFaced: String,
  location: String,
  date: Date,
  duration: String, // e.g., "2 hours", "3 days"
  images: [String], // Array of Cloudinary URLs
  videoLinks: [String],
  equipmentUsed: [String],
  clientType: String, // e.g., Bridal, Corporate
  selfNote: String,
  ratings: Number, // Optional rating (0–5)
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
