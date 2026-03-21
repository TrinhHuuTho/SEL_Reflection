const express = require("express");
const router = express.Router();
const nodeController = require("../controllers/nodeController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");
const rateLimit = require("express-rate-limit");

// Rate limiter for destructive node operations
const deleteNodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 delete requests per windowMs
});

router.get("/", authenticateToken, nodeController.getNodes);
router.get("/:id", authenticateToken, nodeController.getNodeById);

router.post("/", authenticateToken, isAdmin, nodeController.createNode);
router.put("/:id", authenticateToken, isAdmin, nodeController.updateNode);
router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  deleteNodeLimiter,
  nodeController.deleteNode
);

module.exports = router;
