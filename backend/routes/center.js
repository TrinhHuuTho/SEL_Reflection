const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
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
