const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleWare");

// Employee applies for leave
router.post("/apply", leaveController.applyLeave);

// Manager approves/rejects leave
router.post("/manage",  leaveController.manageLeave);

module.exports = router;