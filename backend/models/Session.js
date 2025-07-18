const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  description: { type: String },
  rungood: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: Date,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
]
});

module.exports = mongoose.model('Session', sessionSchema);
