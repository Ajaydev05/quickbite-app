const Order      = require('../models/Order.model');
const Cart       = require('../models/Cart.model');
const Restaurant = require('../models/Restaurant.model');
const MenuItem   = require('../models/MenuItem.model');

exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, payment, couponCode, specialInstructions } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive || !restaurant.isOpen)
      return res.status(400).json({ error: 'Restaurant is not available' });

    // Validate items and calculate pricing
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable)
        return res.status(400).json({ error: `${item.name} is not available` });

      const itemSubtotal = (menuItem.price + (item.customizations?.reduce((s, c) => s + c.price, 0) || 0)) * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customizations: item.customizations || [],
        subtotal: itemSubtotal,
      });
    }

    const tax         = +(subtotal * 0.05).toFixed(2);
    const deliveryFee = restaurant.deliveryFee;
    const discount    = 0; // coupon logic can be added
    const total       = +(subtotal + tax + deliveryFee - discount).toFixed(2);

    if (total < restaurant.minOrder)
      return res.status(400).json({ error: `Minimum order is ₹${restaurant.minOrder}` });

    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      deliveryAddress,
      pricing: { subtotal, deliveryFee, tax, discount, total },
      payment: { method: payment?.method || 'cod' },
      couponCode,
      specialInstructions,
      estimatedDelivery,
      tracking: [{ status: 'pending', message: 'Order placed successfully' }],
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], total: 0 });

    // Update restaurant stats
    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { totalOrders: 1 } });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('restaurant', 'name image address')
      .populate('items.menuItem', 'name image');

    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image phone address')
      .populate('customer', 'name phone')
      .populate('agent', 'name phone');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner    = order.customer._id.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === 'admin';
    const isAgent    = order.agent?._id.toString() === req.user._id.toString();
    if (!isOwner && !isAdmin && !isAgent)
      return res.status(403).json({ error: 'Unauthorized' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const statusMessages = {
      confirmed:         'Your order has been confirmed by the restaurant',
      preparing:         'Restaurant is preparing your food',
      ready_for_pickup:  'Order is ready, assigning delivery agent',
      out_for_delivery:  'Your order is on the way!',
      delivered:         'Order delivered successfully',
      cancelled:         'Order has been cancelled',
    };

    order.status = status;
    order.tracking.push({ status, message: message || statusMessages[status] });
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Unauthorized' });

    if (['out_for_delivery','delivered','cancelled'].includes(order.status))
      return res.status(400).json({ error: `Cannot cancel order in '${order.status}' status` });

    order.status = 'cancelled';
    order.tracking.push({ status: 'cancelled', message: req.body.reason || 'Cancelled by customer' });
    await order.save();

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await require('../models/Restaurant.model').findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ error: 'No restaurant found' });

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { restaurant: restaurant._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('customer', 'name phone');

    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
