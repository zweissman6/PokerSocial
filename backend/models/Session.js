const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stakes: { type: String, required: true },        // e.g., "2/5"
  gameType: { type: String, required: true },      // e.g., "NLH", "PLO"
  location: { type: String },
  buyIn: { type: Number },
  cashOut: { type: Number },
  startTime: { type: String },
  endTime: { type: String },
  date: { type: String },
  photo: { type: String },
  description: { type: String }
});

module.exports = mongoose.model('Session', sessionSchema);
