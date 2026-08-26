const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  // Only connect to MongoDB if URI is provided
  if (process.env.MONGODB_URI) {
    await connectDB();
  } else {
    console.log('MONGODB_URI not set — skipping database connection');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
