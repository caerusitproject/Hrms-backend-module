const Employee = require('../models/Employee.js');
const Leave = require('../models/LeaveRequest.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op } = require('sequelize');





const getTeam = async (managerId) => Employee.findAll({ where: { managerId } });

const getEmployeeProfile = async (id) => Employee.findByPk(id);

const getAttendance = async (empCode) => Attendance.findAll({ where: { empCode } });

const handleLeave = async (id, status) => {
  const leave = await Leave.findByPk(id);
  leave.status = status.toUpperCase();
  await leave.save();
  //const emp = await Employee.findByPk(leave.employeeId);
  //sendEmail(emp.email, 'Leave Update', `Status: ${status}`);
  return leave;
};

const getBroadcasts = async () => Broadcast.findAll();


/*const getPendingLeaves = async (managerId) => {
  return Leave.findAll({
    where: { status: 'pending' },
    include: [{ model: Employee, as: 'manager', where: { id: managerId } }]
  });
};*/

const getPendingLeaves = async (managerId) => {
  return Leave.findAll({
    where: {
      status: 'PENDING',
      managerId: managerId  // directly filter by managerId in the Leaves table
    }
  });
};


const getTodaysBroadcast = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await Broadcast.findAll({
    where: {
      createdAt: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    order: [['createdAt', 'DESC']],
  });
};

const getTeamCount = async (managerId) => {
  return Employee.count({ where: { managerId } });
};

const getDashboardData = async (managerId) => {
  const totalTeamMembers = await getTeamCount(managerId);
  const teamMembers = await getTeam(managerId);
  const pendingLeaves = await getPendingLeaves(managerId);
  const recentBroadcast = await getTodaysBroadcast();
  return { totalTeamMembers, teamMembers, pendingLeaves, recentBroadcast };
};



module.exports = { getTeam, getEmployeeProfile, getAttendance, handleLeave, getBroadcasts, getDashboardData };