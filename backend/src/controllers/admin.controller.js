const User       = require('../models/User.model');
const Restaurant = require('../models/Restaurant.model');
const Order      = require('../models/Order.model');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const [users, restaurants, totalOrders, todayOrders, revenue] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    ]);
    res.json({ success: true, stats: { users, restaurants, totalOrders, todayOrders, revenue: revenue[0]?.total || 0 } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).skip((page-1)*limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ success: true, total, users });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.verifyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json({ success: true, restaurant });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
