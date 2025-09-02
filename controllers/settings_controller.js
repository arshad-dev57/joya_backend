// controllers/simpleSettingsController.js
const AppSettings = require('../models/AppSettings');

// ---------- Payment Link ----------
exports.getPaymentLink = async (_req, res) => {
  try {
    const doc = await AppSettings.getSingleton();
    res.json({ paymentLink: doc.paymentLink || '' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePaymentLink = async (req, res) => {
  try {
    const { paymentLink } = req.body || {};
    const update = {};
    if (typeof paymentLink === 'string') update.paymentLink = paymentLink.trim();

    const doc = await AppSettings.findOneAndUpdate(
      { key: 'app' },
      { $set: update, $setOnInsert: { key: 'app' } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Saved', paymentLink: doc.paymentLink || '' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Disclaimer ----------
exports.getDisclaimer = async (_req, res) => {
  try {
    const doc = await AppSettings.getSingleton();
    res.json({ disclaimer: doc.disclaimer || '' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDisclaimer = async (req, res) => {
  try {
    const { disclaimer } = req.body || {};
    const update = {};
    if (typeof disclaimer === 'string') update.disclaimer = disclaimer.trim();

    const doc = await AppSettings.findOneAndUpdate(
      { key: 'app' },
      { $set: update, $setOnInsert: { key: 'app' } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Saved', disclaimer: doc.disclaimer || '' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
