const User = require('../models/User.model');

exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar'];
    const updates = Object.keys(req.body).filter(k => allowed.includes(k))
      .reduce((obj, k) => { obj[k] = req.body[k]; return obj; }, {});
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
