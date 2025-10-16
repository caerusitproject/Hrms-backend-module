const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

router.get("/hr", authenticate, authorizeRoles("HR","ADMIN"), dashboardController.hrDashboard);
router.get("/manager", authenticate, authorizeRoles("MANAGER","ADMIN"), dashboardController.managerDashboard);//id added
router.get("/employee", authenticate, authorizeRoles("USER","ADMIN","HR"), dashboardController.employeeDashboard);//id added

module.exports = router;