// routes/sessions.js

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');


// GET all sessions, populated with user info
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find().populate('userId');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /sessions/:id - get a single session by ID, including user info
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('userId');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
