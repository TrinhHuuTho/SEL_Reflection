const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Node.js BE API!', status: 'OK' });
});


router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/change-password', authController.changePassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/register-student', authController.registerstudent);
router.post('/register-teacher', authController.registerteacher);

module.exports = router;
