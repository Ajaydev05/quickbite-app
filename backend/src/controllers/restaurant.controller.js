const Restaurant = require('../models/Restaurant.model');
const MenuItem   = require('../models/MenuItem.model');

exports.getAllRestaurants = async (req, res) => {
  try {
    const { city, cuisine, rating, search, sort, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (city)    filter['address.city'] = new RegExp(city, 'i');
    if (cuisine) filter.cuisine = { $in: cuisine.split(',') };
    if (rating)  filter.rating = { $gte: parseFloat(rating) };
    if (search)  filter.name   = new RegExp(search, 'i');

    const sortMap = {
      rating:      { rating: -1 },
      deliveryTime:{ deliveryTime: 1 },
      minOrder:    { minOrder: 1 },
      newest:      { createdAt: -1 }
    };
    const sortBy = sortMap[sort] || { rating: -1 };

    const total = await Restaurant.countDocuments(filter);
    const restaurants = await Restaurant.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('owner', 'name email');

    res.json({ success: true, total, page: parseInt(page), restaurants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const menu = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });
    const menuByCategory = menu.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ success: true, restaurant, menu: menuByCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) return res.status(409).json({ error: 'You already have a registered restaurant' });

    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found or unauthorized' });
    res.json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ error: 'Not found or unauthorized' });
    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();
    res.json({ success: true, isOpen: restaurant.isOpen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ error: 'No restaurant found' });
    res.json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const Order = require('../models/Order.model');
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ error: 'No restaurant found' });

    const today = new Date(); today.setHours(0,0,0,0);
    const [totalOrders, todayOrders, revenue, pending] = await Promise.all([
      Order.countDocuments({ restaurant: restaurant._id }),
      Order.countDocuments({ restaurant: restaurant._id, createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { restaurant: restaurant._id, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.countDocuments({ restaurant: restaurant._id, status: { $in: ['pending','confirmed','preparing'] } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue: revenue[0]?.total || 0,
        pendingOrders: pending,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
