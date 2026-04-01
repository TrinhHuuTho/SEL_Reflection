const express = require("express");
const router = express.Router();
const reflectionController = require("../controllers/reflectionController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");
const rateLimit = require("express-rate-limit");

const reflectionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each authenticated user/IP to 100 reflection requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/",
  reflectionLimiter,
  authenticateToken,
  reflectionController.createReflection,
);
router.get(
  "/node/:nodeId",
  authenticateToken,
  reflectionController.getReflectionsByNode,
);

router.get(
  "/student/:studentId/course/:courseId",
  authenticateToken,
  isAdmin,
  reflectionController.getStudentReflectionsForCourse
);

router.patch(
  "/:id",
  reflectionLimiter,
  authenticateToken,
  reflectionController.updateReflectionById,
);
router.delete(
  "/:id",
  reflectionLimiter,
  authenticateToken,
  reflectionController.deleteReflectionById,
);

module.exports = router;
