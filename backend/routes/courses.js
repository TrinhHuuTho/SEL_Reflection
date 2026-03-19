const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

router.get('/', authenticateToken, coursesController.getCourses);
router.get('/:id', authenticateToken, coursesController.getCourseById);

router.post('/', authenticateToken, isAdmin, coursesController.createCourse);
router.put('/:id', authenticateToken, isAdmin, coursesController.updateCourse);
router.delete('/:id', authenticateToken, isAdmin, coursesController.deleteCourse);

module.exports = router;