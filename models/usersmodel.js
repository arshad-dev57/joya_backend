const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/constants');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  country:  { type: [String], required: true },
  language: { type: String, required: true },
  role:     { type: String, required: true, enum: ['user', 'vendor','admin'] },
  firstname:{ type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true, select: false },
  phone:    { type: String, trim: true },
  image:    { type: String, default: null },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  status: { type: String, enum: ['active','inactive','suspended'], default: 'active', index: true },
  tokenVersion: { type: Number, default: 0 },          // bump to revoke all JWTs
  deactivatedAt: { type: Date },
  deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deactivationReason: { type: String },

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
