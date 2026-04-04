const express = require('express');
const cors = require('cors');
require('dotenv').config();
const crypto = require('crypto');

const connectDB = require('./lib/db');
const healthRoutes = require('./routes/health.route');
const reportGenerate = require('./routes/report.route');
const authRoutes = require('./routes/auth.route');
const dashboardRoutes = require('./routes/dashboard.route');

const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Trust Nginx Proxy
app.set("trust proxy", true);

// IP Anonymization Middleware
app.use((req, res, next) => {
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "0.0.0.0";
    // If x-forwarded-for is a comma-separated list, grab the first IP
    const clientIp = rawIp.split(',')[0].trim();
    
    req.anonymizedIP = crypto
        .createHash("sha256")
        .update(clientIp)
        .digest("hex");
        
    next();
});

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const reportRoutes = require("./routes/reportRoutes");
const chatRoutes = require("./routes/chat.route");

// Routes
app.use('/api', healthRoutes);
app.use('/api', reportGenerate);
app.use("/api/upload", reportRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/chat', chatRoutes);

app.get("/debug", (req, res) => {
    res.json({
        anonymized_ip: req.anonymizedIP,
        original_ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip,
        headers: req.headers
    });
});
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
  console.log(`✅ Server is Running`);
});

module.exports = app;
