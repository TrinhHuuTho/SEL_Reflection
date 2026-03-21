const express = require("express");
const router = express.Router();
const nodeController = require("../controllers/nodeController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");
const rateLimit = require("express-rate-limit");

// Rate limiter for listing node operations
const getNodesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 list requests per windowMs
});

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

// Rate limiter for getting a single node by ID
const getNodeByIdLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 get-by-id requests per windowMs
});

router.get("/", getNodesLimiter, authenticateToken, nodeController.getNodes);
router.get("/:id", getNodeByIdLimiter, authenticateToken, nodeController.getNodeById);

router.post("/", createNodeLimiter, authenticateToken, isAdmin, nodeController.createNode);
router.put("/:id", updateNodeLimiter, authenticateToken, isAdmin, nodeController.updateNode);
router.delete(
  "/:id",
  deleteNodeLimiter,
  authenticateToken,
  isAdmin,
  nodeController.deleteNode
);

module.exports = router;
