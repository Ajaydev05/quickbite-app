const MenuItem = require('../models/MenuItem.model');
const Restaurant = require('../models/Restaurant.model');

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId, isAvailable: true });
    const categories = [...new Set(items.map(i => i.category))];
    const menu = categories.map(cat => ({ category: cat, items: items.filter(i => i.category === cat) }));
    res.json({ success: true, menu });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ error: 'No restaurant found' });
    const item = await MenuItem.create({ ...req.body, restaurant: restaurant._id });
    res.status(201).json({ success: true, item });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurant._id },
      req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    await MenuItem.findOneAndDelete({ _id: req.params.id, restaurant: restaurant._id });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const item = await MenuItem.findOne({ _id: req.params.id, restaurant: restaurant._id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, isAvailable: item.isAvailable });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
