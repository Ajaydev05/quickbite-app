const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/foodapp';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('error', err => console.error('MongoDB error:', err));
};

module.exports = connectDB;
