const router = require('express').Router();
const ctrl   = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/restaurant/:restaurantId', ctrl.getMenuByRestaurant);
router.post('/',          protect, authorize('restaurant_owner'), ctrl.addMenuItem);
router.put('/:id',        protect, authorize('restaurant_owner'), ctrl.updateMenuItem);
router.delete('/:id',     protect, authorize('restaurant_owner'), ctrl.deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('restaurant_owner'), ctrl.toggleAvailability);

module.exports = router;
