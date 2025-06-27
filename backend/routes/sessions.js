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

module.exports = router;
