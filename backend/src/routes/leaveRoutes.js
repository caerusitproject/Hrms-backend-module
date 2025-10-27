const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

// Employee applies for leave
router.post("/apply", leaveController.applyLeave);
router.put("/update/:id", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.updateLeave);
router.delete("/delete/:id", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.deleteLeave);

// Manager approves/rejects leave
//router.post("/manage",  leaveController.manageLeave);
//tanmay's manage leave module
router.patch("/approve/:id", authenticate, authorizeRoles("MANAGER"), leaveController.approveLeave);
router.patch("/reject/:id", authenticate,authorizeRoles("MANAGER"), leaveController.rejectLeave);
router.get("/total", authenticate, authorizeRoles("USER","MANAGER","HR"),leaveController.getLeavesCount);
router.get("/total/month", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.getLeavesCountMonth);
router.get("/leave-list", authenticate,authorizeRoles("MANAGER"), leaveController.getLeavesList);
module.exports = router;