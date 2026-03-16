const express = require('express');
const router = express.Router();
const reflectionController = require('../controllers/reflectionController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, reflectionController.createReflection);
router.get('/journey/:journeyId/node/:nodeId', authenticateToken, reflectionController.getReflectionsByJourneyAndNode);
router.patch('/:id', authenticateToken, reflectionController.updateReflectionById);
router.delete('/:id', authenticateToken, reflectionController.deleteReflectionById);

module.exports = router;
