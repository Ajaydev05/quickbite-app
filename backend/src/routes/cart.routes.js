const router = require('express').Router();
const ctrl   = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/',                protect, ctrl.getCart);
router.post('/add',            protect, ctrl.addToCart);
router.put('/item/:itemId',    protect, ctrl.updateCartItem);
router.delete('/clear',        protect, ctrl.clearCart);

module.exports = router;
