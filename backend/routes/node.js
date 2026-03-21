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

// Rate limiter for node update operations
const updateNodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 update requests per windowMs
});

// Rate limiter for node creation operations
const createNodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 create requests per windowMs
});

router.get("/", authenticateToken, nodeController.getNodes);
router.get("/:id", authenticateToken, nodeController.getNodeById);

router.post("/", authenticateToken, isAdmin, createNodeLimiter, nodeController.createNode);
router.put("/:id", authenticateToken, isAdmin, updateNodeLimiter, nodeController.updateNode);
router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  deleteNodeLimiter,
  nodeController.deleteNode
);

module.exports = router;
