const Employee = require('../models/Employee.js');
const Leave = require('../models/LeaveRequest.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op } = require('sequelize');

class ManagerService {
  static async getTeam(managerId) {
    return Employee.findAll({ where: { managerId } });
  }

  static async getEmployeeProfile(id) {
    return Employee.findByPk(id);
  }

  static async getAttendance(empCode) {
    return Attendance.findAll({ where: { empCode } });
  }

  static async handleLeave(id, status) {
    const leave = await Leave.findByPk(id);
    if (!leave) throw new Error('Leave not found');
    leave.status = status.toUpperCase();
    await leave.save();
    // const emp = await Employee.findByPk(leave.employeeId);
    // sendEmail(emp.email, 'Leave Update', `Status: ${status}`);
    return leave;
  }

  static async getBroadcasts() {
    return Broadcast.findAll();
  }

  static async getPendingLeaves(managerId) {
    return Leave.findAll({
      where: {
        status: 'PENDING',
        managerId
      }
    });
  }

  static async getTodaysBroadcast() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return Broadcast.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  static async getTeamCount(managerId) {
    return Employee.count({ where: { managerId } });
  }

  static async getDashboardData(managerId) {
    const totalTeamMembers = await this.getTeamCount(managerId);
    const teamMembers = await this.getTeam(managerId);
    const pendingLeaves = await this.getPendingLeaves(managerId);
    const recentBroadcast = await this.getTodaysBroadcast();
    return { totalTeamMembers, teamMembers, pendingLeaves, recentBroadcast };
  }
}

module.exports = ManagerService;