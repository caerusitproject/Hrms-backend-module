const Employee = require('../models/Employee.js');
const Leave = require('../models/LeaveRequest.js');
const LeaveInfo = require('../models/LeaveInfo.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op } = require('sequelize');
const { stat } = require('fs');

class ManagerService {

  static async handleLeave(id, status) {

    if (status.toUpperCase() === 'APPROVED') {
      const leave = await this.approvalProcess(id);
      return leave;
    }
    const leave = await Leave.findByPk(id);
    if (!leave) throw new Error('Leave not found');
    leave.status = status.toUpperCase();
    await leave.save();
    return leave;
  }

  static async approvalProcess(leaveId) {
    const leave = await Leave.findByPk(leaveId);
    if (!leave) throw new Error('Leave not found');
    const employeeId = leave.employeeId;
    const leaveInfo = await LeaveInfo.findOne({ where: { employeeId } });
    if (!leaveInfo) throw new Error('Leave record not found');
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const daysApplied = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const availableCasualLeaves = leaveInfo.casualLeave || 0;
    let message = 'Leave approved successfully';
    let newCasualLeaves = availableCasualLeaves - daysApplied;
    if (newCasualLeaves < 0) {
      message = 'Leave approved, but your casual leaves are not enough. It will be deducted from attendance.';
      newCasualLeaves = 0;
    }
    await leave.update({ status: 'APPROVED' });
    await leaveInfo.update({ casualLeave: newCasualLeaves });
    return {
      leave,
      message
    };
  }

  static async getTeam(managerId) {
    return Employee.findAll({ where: { managerId } });
  }

  static async getEmployeeProfile(id) {
    return Employee.findByPk(id);
  }

  static async getAttendance(empCode) {
    return Attendance.findAll({ where: { empCode } });
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