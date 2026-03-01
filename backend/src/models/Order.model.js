const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  menuItem:      { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:          String,
  price:         Number,
  quantity:      { type: Number, min: 1 },
  customizations:[{ name: String, option: String, price: Number }],
  subtotal:      Number,
});

const trackingSchema = new mongoose.Schema({
  status:    String,
  message:   String,
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId:    { type: String, default: () => `ORD-${uuidv4().slice(0,8).toUpperCase()}`, unique: true },
  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  agent:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items:      [orderItemSchema],
  status: {
    type: String,
    enum: ['pending','confirmed','preparing','ready_for_pickup','out_for_delivery','delivered','cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
    lat:     Number,
    lng:     Number,
  },
  pricing: {
    subtotal:    Number,
    deliveryFee: Number,
    tax:         Number,
    discount:    { type: Number, default: 0 },
    total:       Number,
  },
  payment: {
    method:    { type: String, enum: ['card','upi','wallet','cod'], default: 'cod' },
    status:    { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
    transactionId: String,
  },
  couponCode:   String,
  specialInstructions: String,
  estimatedDelivery: Date,
  deliveredAt:  Date,
  tracking:     [trackingSchema],
  rating:       { type: Number, min: 1, max: 5 },
  review:       String,
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ agent: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
