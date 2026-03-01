const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  options:  [{ label: String, price: { type: Number, default: 0 } }],
  required: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false }
});

const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:       { type: String, required: true, trim: true },
  description:{ type: String, maxlength: 300 },
  price:      { type: Number, required: true, min: 0 },
  category:   { type: String, required: true },
  image:      { type: String, default: '' },
  isVeg:      { type: Boolean, default: false },
  isAvailable:{ type: Boolean, default: true },
  isBestSeller:{ type: Boolean, default: false },
  customizations: [customizationSchema],
  nutrition: {
    calories: Number,
    protein:  Number,
    carbs:    Number,
    fat:      Number,
  },
  tags:       [String],
  rating:     { type: Number, default: 0 },
  totalOrders:{ type: Number, default: 0 },
}, { timestamps: true });

menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
