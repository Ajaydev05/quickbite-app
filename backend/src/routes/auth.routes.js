const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').notEmpty(),
], ctrl.register);

router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.put('/update-password', protect, ctrl.updatePassword);

module.exports = router;
