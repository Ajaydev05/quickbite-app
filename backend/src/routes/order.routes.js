const router = require('express').Router();
const ctrl   = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/',                         protect, ctrl.placeOrder);
router.get('/my',                        protect, ctrl.getMyOrders);
router.get('/restaurant',  protect, authorize('restaurant_owner'), ctrl.getRestaurantOrders);
router.get('/:id',                       protect, ctrl.getOrderById);
router.patch('/:id/status', protect, authorize('restaurant_owner','admin','delivery_agent'), ctrl.updateOrderStatus);
router.patch('/:id/cancel',              protect, ctrl.cancelOrder);

module.exports = router;
