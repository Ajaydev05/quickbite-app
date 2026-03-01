const router = require('express').Router();
const ctrl   = require('../controllers/restaurant.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/',                       ctrl.getAllRestaurants);
router.get('/my',   protect, authorize('restaurant_owner'), ctrl.getMyRestaurant);
router.get('/my/dashboard', protect, authorize('restaurant_owner'), ctrl.getDashboardStats);
router.get('/:id',                    ctrl.getRestaurantById);
router.post('/',    protect, authorize('restaurant_owner'), ctrl.createRestaurant);
router.put('/:id',  protect, authorize('restaurant_owner'), ctrl.updateRestaurant);
router.patch('/:id/toggle', protect, authorize('restaurant_owner'), ctrl.toggleRestaurantStatus);

module.exports = router;
