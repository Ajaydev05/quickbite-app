const router = require('express').Router();
const ctrl   = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/',                              protect, ctrl.addReview);
router.get('/restaurant/:restaurantId',       ctrl.getRestaurantReviews);

module.exports = router;
