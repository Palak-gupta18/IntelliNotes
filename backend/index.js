const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // <-- Import the DB connection
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
require('./workers/pdfWorker');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB(); // <-- Run the connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
// Basic Route
app.get('/', (req, res) => {
  res.send('AI Study Assistant Backend is running with JavaScript!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
