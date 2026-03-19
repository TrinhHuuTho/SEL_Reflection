const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// teacher-specific
router.get('/information', authenticateToken, classController.getClassInformation);
router.put('/change-information', authenticateToken, classController.changeClassInformation);

// general CRUD (admin/authorized)
router.get('/', authenticateToken, classController.getClasses);
router.get('/:id', authenticateToken, classController.getClassById);
router.post('/', authenticateToken, isAdmin, classController.createClass);
router.put('/:id', authenticateToken, isAdmin, classController.updateClass);
router.delete('/:id', authenticateToken, isAdmin, classController.deleteClass);

// courses under class
router.get('/:id/courses', authenticateToken, classController.getCoursesForClass);

module.exports = router;
