const Employee = require('../models/Employee.js');
const Leave = require('../models/LeaveRequest.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');

const getTeam = async (managerId) => Employee.findAll({ where: { managerId } });

const getEmployeeProfile = async (id) => Employee.findByPk(id);

const getAttendance = async (employeeId) => Attendance.findAll({ where: { employeeId } });

const handleLeave = async (leaveId, status) => {
  const leave = await Leave.findByPk(leaveId);
  leave.status = status;
  await leave.save();
  const emp = await Employee.findByPk(leave.employeeId);
  //sendEmail(emp.email, 'Leave Update', `Status: ${status}`);
  return leave;
};

const getBroadcasts = async () => Broadcast.findAll();

module.exports = { getTeam, getEmployeeProfile, getAttendance, handleLeave, getBroadcasts };