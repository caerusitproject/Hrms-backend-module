const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const upload = require('../middleware/uploadMiddleware');


// Upload CSV and import to database
router.post('/upload/csv', upload.single('csvfile'), AttendanceController.uploadCsv);

// Get all attendance records
router.get('/records', AttendanceController.getAllAttendance);

// Get attendance records by employee ID
router.get('/record/:empCode/:month/:year', AttendanceController.getAttendanceByEmployee);

module.exports = router;