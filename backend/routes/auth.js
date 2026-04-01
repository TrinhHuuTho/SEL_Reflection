const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Node.js BE API!', status: 'OK' });
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    try {
      const accessToken = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1m' }
      );

      const refreshToken = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email
        },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        { expiresIn: '7d' }
      );

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  }
);

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/change-password', authController.changePassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/register-student', authController.registerstudent);
router.post('/register-teacher', authController.registerteacher);

module.exports = router;
