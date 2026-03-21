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
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// Center CRUD (admin-only for write operations)
router.get('/', authenticateToken, centerController.getCenters);
router.get('/:id', authenticateToken, centerController.getCenterById);
router.post('/', authenticateToken, isAdmin, centerController.createCenter);
router.put('/:id', authenticateToken, isAdmin, centerController.updateCenter);
router.delete('/:id', authenticateToken, isAdmin, centerController.deleteCenter);

// new API
router.post('/:id/add-teachers', authenticateToken, isAdmin, centerController.addTeachersToCenter);

module.exports = router;
