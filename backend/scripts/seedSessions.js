require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');

async function addTestSessions() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // 1. Find the user you want to add sessions for
  // Change the username if needed
  const user = await User.findOne({ userName: 'philivey' });

  if (!user) {
    console.error('User not found! Please check the userName or _id.');
    return mongoose.connection.close();
  }

  // 2. Create new sessions for that user
  const newSessions = [
    {
      userId: user._id,
      stakes: '1/2 NLH',
      gameType: 'NLH',
      location: 'Bellagio, Las Vegas',
      buyIn: 200,
      cashOut: 400,
      startTime: '2024-07-01T18:00',
      endTime: '2024-07-01T23:30',
      date: '2024-07-01',
      photo: '',
      description: 'Standard grind, doubled up at the end.'
    },
    {
      userId: user._id,
      stakes: '2/5 NLH',
      gameType: 'NLH',
      location: 'Wynn, Las Vegas',
      buyIn: 500,
      cashOut: 950,
      startTime: '2024-07-02T16:10',
      endTime: '2024-07-02T21:00',
      date: '2024-07-02',
      photo: '',
      description: 'Caught a big bluff and stacked someone.'
    },
    {
      userId: user._id,
      stakes: '1/3 NLH',
      gameType: 'NLH',
      location: 'Commerce, LA',
      buyIn: 300,
      cashOut: 120,
      startTime: '2024-07-03T13:00',
      endTime: '2024-07-03T16:20',
      date: '2024-07-03',
      photo: '',
      description: 'Couldn’t get anything going. Rough session.'
    },
    {
      userId: user._id,
      stakes: '5/5 PLO',
      gameType: 'PLO',
      location: 'Aria, Las Vegas',
      buyIn: 1000,
      cashOut: 1750,
      startTime: '2024-07-04T19:30',
      endTime: '2024-07-05T01:30',
      date: '2024-07-04',
      photo: '',
      description: 'Huge hand with aces, scooped a monster pot.'
    },
    {
      userId: user._id,
      stakes: '2/5 NLH',
      gameType: 'NLH',
      location: 'WSOP Paris',
      buyIn: 500,
      cashOut: 0,
      startTime: '2024-07-05T17:45',
      endTime: '2024-07-05T22:10',
      date: '2024-07-05',
      photo: '',
      description: 'Busted with AK < JJ, oh well!'
    },
  ];

  // 3. Insert sessions
  const createdSessions = await Session.insertMany(newSessions);

  // 4. Add sessions to user's sessions array
  user.sessions.push(...createdSessions.map(s => s._id));
  await user.save();

  console.log('Added new sessions for user:', user.userName);
  mongoose.connection.close();
}

addTestSessions();
