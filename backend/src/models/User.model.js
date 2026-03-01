const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  lat:      Number,
  lng:      Number,
  isDefault:{ type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  phone:     { type: String, required: true },
  role:      { type: String, enum: ['customer', 'restaurant_owner', 'delivery_agent', 'admin'], default: 'customer' },
  avatar:    { type: String, default: '' },
  addresses: [addressSchema],
  isActive:  { type: Boolean, default: true },
  isVerified:{ type: Boolean, default: false },
  lastLogin: Date,
  fcmToken:  String,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
