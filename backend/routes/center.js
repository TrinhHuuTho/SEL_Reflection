const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const { authenticateToken } = require('../middlewares/auth');

// Endpoint lấy danh sách các trung tâm (Sử dụng authenticateToken nếu muốn bảo mật)
router.get('/', authenticateToken, centerController.getAllCenters);

// Endpoint tạo trung tâm mới
router.post('/', authenticateToken, centerController.createCenter);

// Endpoint xóa trung tâm
router.delete('/:id', authenticateToken, centerController.deleteCenter);

module.exports = router;
