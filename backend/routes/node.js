const express = require("express");
const router = express.Router();
const nodeController = require("../controllers/nodeController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");

router.get("/", authenticateToken, nodeController.getNodes);
router.get("/:id", authenticateToken, nodeController.getNodeById);

router.post("/", authenticateToken, isAdmin, nodeController.createNode);
router.put("/:id", authenticateToken, isAdmin, nodeController.updateNode);
router.delete("/:id", authenticateToken, isAdmin, nodeController.deleteNode);

module.exports = router;
