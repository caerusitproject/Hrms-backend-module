const Employee = require('../models/Employee.js');
const Leave = require('../models/LeaveRequest.js');
const LeaveInfo = require('../models/LeaveInfo.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op, where } = require('sequelize');
const { stat } = require('fs');

class ManagerService {

  static async handleLeave(id, status) {
    try {
      if (status.toUpperCase() === 'APPROVED') return await this.approvalProcess(id);
      const leave = await Leave.findByPk(id);
      if (!leave) throw new Error('Leave not found');
      leave.status = status.toUpperCase();
      await leave.save();
      return leave;
    } catch (error) {
      throw error;
    }
  }

  static async approvalProcess(leaveId) {
    const leave = await Leave.findByPk(leaveId);
    if (!leave) throw new Error('Leave not found');
    const employeeId = leave.employeeId;
    const leaveInfo = await LeaveInfo.findOne({ where: { employeeId } });
    if (!leaveInfo) throw new Error('Leave records not found for the employee in the leave info table');
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
    const team = await Employee.findAll({ where: { managerId, status: 'Active' }, attributes: ['id', 'name', 'email', 'designation', 'status'] });
    if (!team) {
      throw new Error('Error while retrieving team members');
    }
    if (team.length === 0) {
      return { message: 'No team members assigned to the manager', team: [] };
    }
    return team;
  }


static async getAttendance(empCode) {
  const emp= await Employee.findOne({where:{empCode}});
  if(!emp)throw new Error("NO EMPLOYEE EXISTS FOR THIS ID!!!");
  const attend = await Attendance.findAll({
    where: { empCode },
    order: [['date', 'DESC']]
  });
  if (!attend || attend.length === 0) {
    return {
      message: "No attendance records present for this employee",
      data: []
    };
  }
  return {
    message: "Attendance records retrieved successfully",
    data: attend
  };
}


  static async getPendingLeaves(managerId) {
    const pendleave = await Leave.findAll({
      where: {
        status: 'PENDING',
        managerId
      }
    });
    if (pendleave.length === 0) {
      return { message: 'No Leaves Pending!', pendleave: [] };
    }
    return pendleave;
  }

  static async getTodaysBroadcast() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaybroad = await Broadcast.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    if(!todaybroad){throw new Error("Error while retrieving the broadcast");}
    if (todaybroad.length === 0) {
      return { message: 'No Broadcasts for today!', todaybroad: [] };
    }
    return todaybroad;
  }

  static async getTeamCount(managerId) {
    return Employee.count({ where: { managerId } });
  }

  static async getDashboardData(managerId) {
    try {
      const totalTeamMembers = await this.getTeamCount(managerId);
      const teamMembers = await this.getTeam(managerId);
      const pendingLeaves = await this.getPendingLeaves(managerId);
      const recentBroadcast = await this.getTodaysBroadcast();
      return { totalTeamMembers, teamMembers, pendingLeaves, recentBroadcast };
    }catch(error){
      throw error;
    }
  }


}

module.exports = ManagerService;