const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, maxlength: 500 },
  images:     [String],
  foodRating:     { type: Number, min: 1, max: 5 },
  deliveryRating: { type: Number, min: 1, max: 5 },
  packagingRating:{ type: Number, min: 1, max: 5 },
  ownerReply: {
    comment:   String,
    repliedAt: Date
  },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

module.exports = mongoose.model('Review', reviewSchema);
