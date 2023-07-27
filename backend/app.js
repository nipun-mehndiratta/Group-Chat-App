const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Message = require('./models/Message');
const app = express();
const jwt = require('jsonwebtoken');
const server = require('http').createServer(app);  
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://userid:password@cluster0.psrmrly.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "chatApp" });

const db = mongoose.connection;  
db.on('error', console.error.bind(console, 'MongoDB connection error:'));  

// Middleware to check for a valid JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.userId = user.userId;
    next();
  });
};

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not register user.' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(404).json({ message: 'User not found or invalid credentials.' });
    }

    // Create a JWT token with user ID as the payload
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    
    res.status(200).json({ message: 'Login successful.', token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Could not log in.' });
  }
});

// Real-time chat using Socket.io
io.on('connection', (socket) => {  
  console.log('user connected');

  socket.on('newMessage', async (data) => {
    const { userId, text } = data;
    if (!userId || !text) {
      return;
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return;
      }

      const newMessage = new Message({
        userId: user,
        text: text,
      });

      await newMessage.save();
      io.emit('messageReceived', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

  
  app.post('/api/messages',authenticateToken, async (req, res) => {
    const { userId, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      const newMessage = new Message({
        userId: user,
        text: text,
      });
  
      await newMessage.save();
      io.emit('messageReceived', newMessage); 
      res.status(201).json({ message: 'Message sent successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Could not save the message.' });
    }
  });


app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find().populate('userId', 'username');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch messages.' });
  }
});





const port = 3001;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
