const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./lib/db');
const healthRoutes = require('./routes/health.route');
const reportRoutes = require('./routes/report.route');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const reportRoutes = require("./routes/reportRoutes");

// Routes
app.use('/api', healthRoutes);
app.use("/api/upload", reportRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Craftathon Backend API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'Health check' },
      { path: '/api/report', method: 'POST', description: 'Submit a report' },
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════╗
║   Craftathon Backend Server       ║
║   Environment: ${NODE_ENV.padEnd(19)} ║
║   Port: ${PORT.toString().padEnd(25)} ║
╚═══════════════════════════════════╝
  `);
});

module.exports = app;
