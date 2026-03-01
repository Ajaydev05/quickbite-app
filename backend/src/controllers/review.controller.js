const Review     = require('../models/Review.model');
const Order      = require('../models/Order.model');
const Restaurant = require('../models/Restaurant.model');

exports.addReview = async (req, res) => {
  try {
    const { orderId, rating, comment, foodRating, deliveryRating, packagingRating } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'delivered')
      return res.status(400).json({ error: 'Can only review delivered orders' });

    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(409).json({ error: 'Already reviewed this order' });

    const review = await Review.create({
      user: req.user._id, restaurant: order.restaurant, order: orderId,
      rating, comment, foodRating, deliveryRating, packagingRating
    });

    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: order.restaurant });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(order.restaurant, { rating: avg.toFixed(1), totalReviews: reviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRestaurantReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name avatar');
    const total = await Review.countDocuments({ restaurant: req.params.restaurantId });
    res.json({ success: true, total, reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
