require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Session.deleteMany({});
  await User.deleteMany({});

  // 1. Create users
  const phil = await User.create({
    userName: 'philivey',
    firstName: 'Phil',
    lastName: 'Ivey',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    favoriteCardroom: 'Aria, Las Vegas',
    following: [],
    followers: [],
    sessions: []
  });

  const liv = await User.create({
    userName: 'livboeree',
    firstName: 'Liv',
    lastName: 'Boeree',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    favoriteCardroom: 'Commerce, LA',
    following: [phil._id],
    followers: [],
    sessions: []
  });

  // Make Phil follow Liv, and update followers for both
  phil.following.push(liv._id);
  phil.followers.push(liv._id);
  liv.followers.push(phil._id);
  await phil.save();
  await liv.save();

  // 2. Create sessions
  const session1 = await Session.create({
    userId: phil._id,
    stakes: '2/5',
    gameType: 'NLH',
    location: 'Aria, Las Vegas',
    buyIn: 500,
    cashOut: 1875,
    startTime: '2024-06-23T19:00',
    endTime: '2024-06-24T02:30',
    date: '2024-06-23',
    photo: 'https://a.storyblok.com/f/161938/1200x630/bd69c0aa27/the-art-of-poker-chip-stacking.jpg/m/',
    description: 'Had an epic run tonight! Flopped two sets, rivered a flush, good times.'
  });

  const session2 = await Session.create({
    userId: liv._id,
    stakes: '1/2',
    gameType: 'PLO',
    location: 'Commerce, LA',
    buyIn: 300,
    cashOut: 1100,
    startTime: '2024-06-22T15:45',
    endTime: '2024-06-22T20:10',
    date: '2024-06-22',
    photo: '',
    description: 'Swung up and down, but ended up with a nice session!'
  });

  // 3. Link sessions to users
  phil.sessions.push(session1._id);
  liv.sessions.push(session2._id);
  await phil.save();
  await liv.save();

  console.log('Database seeded!');
  mongoose.connection.close();
}

seed();
