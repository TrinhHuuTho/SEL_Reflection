const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.get('/information', authenticateToken, userRateLimiter, userController.getUserInformation);
router.put('/change-information', authenticateToken, userRateLimiter, userController.changeUserInformation);

module.exports = router;
