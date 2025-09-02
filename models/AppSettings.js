// models/AppSettings.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const appSettingsSchema = new Schema(
  {
    key: { type: String, default: 'app', unique: true },
    paymentLink: { type: String, default: '' }, // just a string
    disclaimer: { type: String, default: '' },  // just a string
  },
  { timestamps: true }
);

appSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'app' });
  if (!doc) doc = await this.create({ key: 'app' });
  return doc;
};

module.exports = model('AppSettings', appSettingsSchema);
