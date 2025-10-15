const fs = require('fs');
const path = require('path');
const CsvService = require('../services/attendanceService');

async function uploadCsv(req, res) {
  try {
    const filePath = path.join(__dirname, '../csv-files/attendance.csv');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'CSV file not found in folder'
      });
    }
    const result = await CsvService.importCsvToDatabase(filePath);
    return res.status(200).json({
      success: true,
      message: 'CSV imported successfully',
      ...result
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to import CSV',
      error: error.message
    });
  }
}

async function getAllAttendance(req, res) {
  try {
    const records = await CsvService.getAllAttendanceRecords();
    return res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records',
      error: error.message
    });
  }
}

async function getAttendanceByEmployee(req, res) {
  try {
    const {empCode,month,year}   = req.params;
    if (!empCode && !month) {
      return res.status(400).json({
        success: false,
        message: 'Employee Code & Month is required'
      });
    }  
    const records = await CsvService.getAttendanceByEmployeeId(empCode,month,year);
    return res.status(200).json({
      success: true,
      message: `Attendance records for employee ${empCode} retrieved successfully`,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee attendance records',
      error: error.message
    });
  }
}



module.exports = {
  uploadCsv,
  getAllAttendance,
  getAttendanceByEmployee
};