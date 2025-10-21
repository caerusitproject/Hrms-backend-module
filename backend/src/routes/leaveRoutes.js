const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleWare");

// Employee applies for leave
router.post("/apply", leaveController.applyLeave);

// Manager approves/rejects leave
//router.post("/manage",  leaveController.manageLeave);
//tanmay's manage leave module
router.patch("/approve/:id", authMiddleware.authenticate, leaveController.approveLeave);//to be reviewed later
router.patch("/reject/:id", authMiddleware.authenticate, leaveController.rejectLeave);
module.exports = router;