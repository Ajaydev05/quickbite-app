const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes       = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const menuRoutes       = require('./routes/menu.routes');
const orderRoutes      = require('./routes/order.routes');
const userRoutes       = require('./routes/user.routes');
const cartRoutes       = require('./routes/cart.routes');
const reviewRoutes     = require('./routes/review.routes');
const adminRoutes      = require('./routes/admin.routes');

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('combined'));

// ── Rate Limiting ──
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/', authLimiter);

// ── Body Parser ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/ready',  (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (dbReady) return res.json({ status: 'ready' });
  res.status(503).json({ status: 'not ready', db: 'disconnected' });
});

// ── Routes ──
app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu',        menuRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/reviews',     reviewRoutes);
app.use('/api/admin',       adminRoutes);

// ── 404 Handler ──
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── MongoDB Connection ──
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

module.exports = app;
