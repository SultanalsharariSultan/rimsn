const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  message: { type: String, default: 'SOS - Lost in Desert' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Emergency', emergencySchema);