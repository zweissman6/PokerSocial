const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true }, // used as ID & lookup
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  avatar: { type: String },
  favoriteCardroom: { type: String },
  password: { type: String, required: true },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users they follow
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users that follow them
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }] // sessions this user has posted
});

module.exports = mongoose.model('User', userSchema);
