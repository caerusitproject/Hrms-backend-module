const Attendance = require('../models/Attendance');

async function addAttendance(req, res) {
  try {
    const { employeeId } = req.params;
    const { date, checkIn, checkOut, status } = req.body;
    const att = await Attendance.create({ employeeId, date, checkIn, checkOut, status });
    return res.status(201).json(att);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function getAttendanceForEmployee(req, res) {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.findAll({ where: { employeeId } });
    return res.json(records);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { addAttendance, getAttendanceForEmployee };
