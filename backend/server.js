require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');


const app = express();
app.use(cors());
app.use(express.json()); // For JSON request bodies
app.use('/users', userRoutes);
app.use('/auth', authRoutes)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Session routes (imported below)
const sessionsRouter = require('./routes/sessions');
app.use('/sessions', sessionsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
