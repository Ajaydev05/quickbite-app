const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));
router.get('/dashboard',                  ctrl.getDashboard);
router.get('/users',                      ctrl.getAllUsers);
router.patch('/restaurants/:id/verify',   ctrl.verifyRestaurant);
router.patch('/users/:id/toggle',         ctrl.toggleUserStatus);

module.exports = router;
