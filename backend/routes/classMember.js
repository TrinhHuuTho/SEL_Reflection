const express = require('express');
const router = express.Router();
const classMemberController = require('../controllers/classMemberController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken); // Khoá

router.get('/members/:classId', classMemberController.getMembersByClass);
router.post('/add', classMemberController.addStudentToClass);
router.delete('/remove/:classId/:studentId', classMemberController.removeStudentFromClass);
router.get('/available/:centerId/:classId', classMemberController.getAvailableStudents);
router.get('/student/:studentId', classMemberController.getClassesForStudent);
router.get('/my-classes', classMemberController.getClassesForStudent);

module.exports = router;
