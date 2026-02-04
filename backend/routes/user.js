const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/information', authenticateToken, userController.getUserInformation);
router.put('/change-information', authenticateToken, userController.changeUserInformation);

module.exports = router;
