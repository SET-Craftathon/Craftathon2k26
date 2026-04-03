const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    }
  } else {
    console.warn('⚠️ No MongoDB URI found in environment variables. Database not connected.');
  }
};

module.exports = connectDB;
