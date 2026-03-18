const express = require('express');
const router = express.Router();
const reflectionController = require('../controllers/reflectionController');
const { authenticateToken } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const reflectionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each authenticated user/IP to 100 reflection requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', authenticateToken, reflectionLimiter, reflectionController.createReflection);
router.get('/journey/:journeyId/node/:nodeId', authenticateToken, reflectionLimiter, reflectionController.getReflectionsByJourneyAndNode);
router.patch('/:id', authenticateToken, reflectionLimiter, reflectionController.updateReflectionById);
router.delete('/:id', authenticateToken, reflectionLimiter, reflectionController.deleteReflectionById);

module.exports = router;
