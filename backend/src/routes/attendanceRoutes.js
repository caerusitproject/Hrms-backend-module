const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const upload = require('../middleware/uploadMiddleware');
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

// Upload CSV and import to database
router.post('/upload/csv', authenticate, authorizeRoles('HR', 'ADMIN'), AttendanceController.uploadCsv);

// Get all attendance records
router.get('/records', authenticate, authorizeRoles('HR', 'ADMIN'), AttendanceController.getAttendance);

router.get('/record/:empCode/:month/:year',authenticate, authorizeRoles('HR', 'ADMIN','MANAGER'), AttendanceController.getAttendanceByEmployee);

module.exports = router;