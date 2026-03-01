const router = require('express').Router();
const ctrl   = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile',              protect, ctrl.getProfile);
router.put('/profile',              protect, ctrl.updateProfile);
router.post('/address',             protect, ctrl.addAddress);
router.delete('/address/:addressId',protect, ctrl.deleteAddress);

module.exports = router;
