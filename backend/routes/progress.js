const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");

// Route cho Chế độ Học sinh view bản thân
router.get(
  "/:courseId/my-progress",
  authenticateToken,
  progressController.getMyProgress
);

// Route cho Chế độ Giáo viên View cả lớp
router.get(
  "/:courseId/class",
  authenticateToken,
  isAdmin,
  progressController.getClassProgress
);

module.exports = router;
