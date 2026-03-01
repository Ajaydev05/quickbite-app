const Cart     = require('../models/Cart.model');
const MenuItem = require('../models/MenuItem.model');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('restaurant', 'name image deliveryFee minOrder')
      .populate('items.menuItem', 'name price image isAvailable');
    res.json({ success: true, cart: cart || { items: [], total: 0 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity = 1, customizations = [] } = req.body;

    const menuItem = await MenuItem.findById(menuItemId).populate('restaurant');
    if (!menuItem || !menuItem.isAvailable)
      return res.status(404).json({ error: 'Item not available' });

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart && cart.restaurant && cart.restaurant.toString() !== menuItem.restaurant._id.toString()) {
      return res.status(409).json({
        error: 'Cart has items from another restaurant. Clear cart to add this item.',
        clearRequired: true
      });
    }

    const extraPrice = customizations.reduce((s, c) => s + (c.price || 0), 0);
    const itemPrice  = menuItem.price + extraPrice;
    const subtotal   = itemPrice * quantity;

    if (!cart) {
      cart = new Cart({ user: req.user._id, restaurant: menuItem.restaurant._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(i =>
      i.menuItem.toString() === menuItemId && JSON.stringify(i.customizations) === JSON.stringify(customizations)
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
      cart.items[existingIdx].subtotal  = cart.items[existingIdx].quantity * itemPrice;
    } else {
      cart.items.push({ menuItem: menuItemId, name: menuItem.name, price: itemPrice, quantity, customizations, subtotal });
    }

    cart.calculateTotal();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
      item.subtotal = item.price * quantity;
    }

    if (cart.items.length === 0) cart.restaurant = undefined;
    cart.calculateTotal();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], total: 0, restaurant: undefined, couponCode: undefined, discount: 0 }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
