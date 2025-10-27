const express = require("express");
const router = express.Router();
const leaveInfoController = require("../controllers/leaveInfoController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

// Employee applies for leave
router.post("/",authenticate,authorizeRoles("ADMIN"), leaveInfoController.addOrUpdateLeave);
router.get("/",authenticate,authorizeRoles("ADMIN"), leaveInfoController.getAllLeaveInfo);
router.get("/:id",authenticate,authorizeRoles("ADMIN"), leaveInfoController.getLeaveInfoByEmployee);
router.delete("/:id",authenticate,authorizeRoles("ADMIN"), leaveInfoController.deleteLeaveInfo);
// router.put("/update/:id", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.updateLeave);
// router.delete("/delete/:id", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.deleteLeave);

// // Manager approves/rejects leave
// //router.post("/manage",  leaveController.manageLeave);
// //tanmay's manage leave module
// router.patch("/approve/:id", authenticate, authorizeRoles("MANAGER"), leaveController.approveLeave);
// router.patch("/reject/:id", authenticate,authorizeRoles("MANAGER"), leaveController.rejectLeave);
// router.get("/total", authenticate, authorizeRoles("USER","MANAGER","HR"),leaveController.getLeavesCount);
// router.get("/total/month", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.getLeavesCountMonth);
// router.get("/leave-list", authenticate,authorizeRoles("USER","MANAGER","HR"), leaveController.getLeavesList);
module.exports = router;