const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const client = require('prom-client');

const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const cartRoutes = require('./routes/cart.routes');
const userRoutes = require('./routes/user.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler } = require('./middleware/error.middleware');

// ─── Prometheus Metrics Setup ─────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'nodejs_' });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

const activeOrdersGauge = new client.Gauge({
  name: 'quickbite_active_orders_total',
  help: 'Number of currently active orders',
  registers: [register],
});

// Export gauge so controllers can update it (accessed after app is required)
global.activeOrdersGauge = activeOrdersGauge;
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ─── Metrics Middleware ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });
  next();
});

// Prometheus metrics endpoint (no rate limiting)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
// ─────────────────────────────────────────────────────────────────────────────

// Health check endpoints
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/ready',  (req, res) => res.json({ status: 'ready',   timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus',       menuRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/reviews',     reviewRoutes);
app.use('/api/payments',    paymentRoutes);

// 404 handler
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;

