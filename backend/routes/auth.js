const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { userName, firstName, lastName, avatar, favoriteCardroom, password } = req.body;
    const existingUser = await User.findOne({ userName });
    if (existingUser) return res.status(409).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userName,
      firstName,
      lastName,
      avatar,
      favoriteCardroom,
      password: hashedPassword,
      following: [],
      followers: [],
      sessions: []
    });
    res.status(201).json({
    message: 'User created',
    user: {
      _id: user._id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      favoriteCardroom: user.favoriteCardroom,
      following: user.following,
      followers: user.followers,
      sessions: user.sessions
    }
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid username or password' });

    // For now, just return basic info (add JWT later if you want)
    res.json({
    message: 'Login successful',
    user: {
      _id: user._id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      favoriteCardroom: user.favoriteCardroom,
      following: user.following,
      followers: user.followers,
      sessions: user.sessions
    }
  });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
