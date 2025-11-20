const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

// Employee applies for leave
router.post("/apply",authenticate,authorizeRoles("USER","MANAGER","HR","ADMIN"), leaveController.applyLeave);
router.patch("/update/:id", authenticate,authorizeRoles("USER","MANAGER","HR","ADMIN"), leaveController.updateLeave);
router.delete("/delete/:id", authenticate,authorizeRoles("USER","MANAGER","HR","ADMIN"), leaveController.deleteLeave);

// Manager approves/rejects leave
//router.post("/manage",  leaveController.manageLeave);
//tanmay's manage leave module
router.patch("/", authenticate, authorizeRoles("MANAGER","ADMIN","HR"), leaveController.approveLeave); 
//router.patch("/reject/:id", authenticate,authorizeRoles("MANAGER","ADMIN","HR"), leaveController.rejectLeave);
router.get("/total", authenticate, authorizeRoles("USER","MANAGER","HR","ADMIN"),leaveController.getLeavesCount);
router.get("/total/month", authenticate,authorizeRoles("USER","MANAGER","HR","ADMIN"), leaveController.getLeavesCountMonth);
router.get("/leave-list", authenticate,authorizeRoles("MANAGER","USER","ADMIN"), leaveController.getLeavesList);
module.exports = router;