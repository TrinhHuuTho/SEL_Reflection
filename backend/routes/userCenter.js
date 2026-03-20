const express = require('express');
const router = express.Router();
const userCenterController = require('../controllers/userCenterController');
const { authenticateToken } = require('../middlewares/auth');

// Route này chỉ áp dụng cho User đã đăng nhập (Giáo viên, Học sinh, Admin)
router.use(authenticateToken);

router.get('/my-center', userCenterController.getMyCenter);
router.post('/join', userCenterController.joinCenter);

module.exports = router;
