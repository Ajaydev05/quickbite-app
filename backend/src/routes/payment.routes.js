const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const Order = require('../models/Order.model');

// POST /api/payments/initiate
router.post('/initiate', protect, asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // In production: integrate Stripe/Razorpay here
  const paymentIntent = {
    id: `pi_${Date.now()}`,
    amount: order.pricing.total * 100,  // in paise
    currency: 'inr',
    status: 'created'
  };

  res.json({ paymentIntent, amount: order.pricing.total });
}));

// POST /api/payments/verify
router.post('/verify', protect, asyncHandler(async (req, res) => {
  const { orderId, transactionId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.payment.status = 'paid';
  order.payment.transactionId = transactionId;
  await order.save();

  res.json({ message: 'Payment verified', order });
}));

module.exports = router;
