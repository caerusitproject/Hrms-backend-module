const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const upload = require('../middleware/uploadMiddleware');
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

// Upload CSV and import to database
router.post('/upload/csv', authenticate, authorizeRoles('HR', 'ADMIN'), upload.single('csvfile'), AttendanceController.uploadCsv);

// Get all attendance records
router.get('/records', authenticate, authorizeRoles('HR', 'ADMIN'), AttendanceController.getAllAttendance);

// Get attendance records by employee ID
router.get('/record/:empCode',authenticate, authorizeRoles('HR', 'ADMIN'), AttendanceController.getAttendanceByEmployee);

module.exports = router;