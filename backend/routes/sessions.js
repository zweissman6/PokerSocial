// routes/sessions.js

const express = require('express');
const mongoose = require('mongoose');
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

// POST /sessions/:id/rungood - toggle rungood for a session by current user
router.post('/:id/rungood', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const alreadyRungood = session.rungood.some(uid => uid.equals(userId));
    if (alreadyRungood) {
      // UNLIKE: remove user
      session.rungood = session.rungood.filter(uid => !uid.equals(userId));
    } else {
      // LIKE: push user to end
      session.rungood.push(userId);
    }
    await session.save();

    await session.populate('rungood', 'userName avatar');
    res.json({
      count: session.rungood.length,
      users: session.rungood,
      liked: !alreadyRungood,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



// GET /sessions/:id/rungood - get all users who gave rungood
router.get('/:id/rungood', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('rungood', 'userName avatar');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ count: session.rungood.length, users: session.rungood });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all comments for a session
router.get('/:id/comments', async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate({
      path: 'comments.user',
      select: 'userName avatar',
    });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session.comments || []);
});

// POST a new comment
router.post('/:id/comments', async (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'userId and text required' });
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newComment = {
    _id: new mongoose.Types.ObjectId(),
    user: user._id,
    text,
    createdAt: new Date(),
  };
  session.comments = session.comments || [];
  session.comments.push(newComment);
  await session.save();

  // repopulate user
  await session.populate({
    path: 'comments.user',
    select: 'userName avatar'
  });
  res.json(session.comments[session.comments.length - 1]);
});

// DELETE a comment (only by its author)
router.delete('/:id/comments/:commentId', async (req, res) => {
  const { userId } = req.query; // passed as ?userId=xxx
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const commentIndex = (session.comments || []).findIndex(
    c => c._id.toString() === req.params.commentId && c.user.toString() === userId
  );
  if (commentIndex === -1) return res.status(403).json({ error: 'Not allowed' });

  session.comments.splice(commentIndex, 1);
  await session.save();
  res.json({ success: true });
});



module.exports = router;
