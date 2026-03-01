const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  menuItem:      { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name:          String,
  price:         Number,
  quantity:      { type: Number, default: 1, min: 1 },
  customizations:[{ name: String, option: String, price: Number }],
  subtotal:      Number,
});

const cartSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  items:      [cartItemSchema],
  total:      { type: Number, default: 0 },
  couponCode: String,
  discount:   { type: Number, default: 0 },
}, { timestamps: true });

cartSchema.methods.calculateTotal = function () {
  this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0) - this.discount;
};

module.exports = mongoose.model('Cart', cartSchema);
