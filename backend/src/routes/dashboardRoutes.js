const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleWare");


router.get("/hr", verifyToken, authorizeRoles("HR"), dashboardController.hrDashboard);
router.get("/manager", verifyToken, authorizeRoles("MANAGER"), dashboardController.managerDashboard);
router.get("/employee", verifyToken, authorizeRoles("USER"), dashboardController.employeeDashboard);

module.exports = router;