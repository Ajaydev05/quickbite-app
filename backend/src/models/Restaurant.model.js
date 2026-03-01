const mongoose = require('mongoose');

const timingSchema = new mongoose.Schema({
  day:   { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  open:  String,
  close: String,
  isClosed: { type: Boolean, default: false }
});

const restaurantSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, maxlength: 500 },
  cuisine:     [{ type: String }],
  image:       { type: String, default: '' },
  coverImage:  { type: String, default: '' },
  phone:       { type: String, required: true },
  email:       String,
  address: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    lat:     Number,
    lng:     Number,
  },
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:   { type: Number, default: 0 },
  minOrder:       { type: Number, default: 0 },
  deliveryFee:    { type: Number, default: 0 },
  deliveryTime:   { type: String, default: '30-45 mins' },
  timings:        [timingSchema],
  isOpen:         { type: Boolean, default: true },
  isVerified:     { type: Boolean, default: false },
  isActive:       { type: Boolean, default: true },
  tags:           [String],
  totalOrders:    { type: Number, default: 0 },
}, { timestamps: true });

restaurantSchema.index({ 'address.city': 1, isActive: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
