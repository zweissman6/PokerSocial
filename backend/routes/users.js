const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');

router.get('/username/:username', async (req, res) => {
  try {
    // Use case-insensitive search if you want (recommended):
    const user = await User.findOne({ userName: { $regex: `^${req.params.username}$`, $options: 'i' } }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sessions for a user, with sorting and optional filters
router.get('/:id/sessions', async (req, res) => {
  try {
    const { sortBy = 'date', order = 'desc', location, stakes, gameType } = req.query;
    const filter = { userId: req.params.id };
    if (location) filter.location = location;
    if (stakes) filter.stakes = stakes;
    if (gameType) filter.gameType = gameType;

    const sessions = await Session.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by ID (excluding password)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
