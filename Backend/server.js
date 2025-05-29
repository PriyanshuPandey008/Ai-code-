require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://ai-code-weld.vercel.app'
];

// CORS configuration for Express
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Welcome message route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Backend API is successfully deployed and running!',
    status: 'active'
  });
});

// Routes
app.use('/ai', require('./src/routes/ai.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/projects', require('./src/routes/project.routes'));
app.use('/api/comments', require('./src/routes/comment.routes'));
app.use('/api/bookmarks', require('./src/routes/bookmark.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Connect to MongoDB with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', {
      name: err.name,
    });   
  }
};

// Initialize database connection
connectDB();



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;