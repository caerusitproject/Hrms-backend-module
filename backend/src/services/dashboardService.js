const Employee = require('../models/Employee.js');
const LeaveRequest = require('../models/LeaveRequest.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op, where } = require('sequelize');
const managerService = require('./managerService.js');
const { stat } = require('fs');

class DashboardService {
  static async getHrDashboardData() {
    try {
      const totalEmployees = await Employee.count();

      const allEmployeesDetails = await Employee.findAll({
        where: { status: 'Active' },
        attributes: ['id', 'name', 'email', 'designation', 'status']
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today

      const upcomingBroadcasts = await Broadcast.findAll({
        where: {
          createdAt: {
            [Op.gte]: today
          }
        },
        order: [['createdAt', 'ASC']]
      });
      if (!upcomingBroadcasts) {
        throw new Error('Error in retrieving broadcasts found');
      }
      const upcomingBroadcastsCount = upcomingBroadcasts.length;

      return { totalEmployees, upcomingBroadcasts, upcomingBroadcastsCount };
    } catch (error) {
      throw new Error('Failed to fetch HR dashboard data');
    }
  }

  static async getManagerDashboardData(managerId) {
    try {
      const teamMembers = await managerService.getTeam(managerId);
      const totalTeamMembers = await managerService.getTeamCount(managerId);
      const pendingLeaves = await managerService.getPendingLeaves(managerId);
      const recentBroadcast = await managerService.getTodaysBroadcast();

      return { totalTeamMembers, teamMembers, pendingLeaves, recentBroadcast };
    } catch (error) {
      throw new Error('Failed to fetch manager dashboard data');
    }
  }

  static async getEmployeeDashboardData(empId) {
    try {
      // Fetch employee profile
      const employeeProfile = await Employee.findByPk(empId, {
        attributes: ['id', 'managerId', 'name', 'email', 'designation', 'status'],
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Fetch all leave requests for the employee
      const leaveRequests = await LeaveRequest.findAll({
        where: { employeeId: empId },
        attributes: ['id', 'startDate', 'endDate', 'reason', 'status', 'managerId']
      });
      const leaveRequestInfo = {
        list: leaveRequests,
        message: leaveRequests.length === 0 ? 'No leave requests found' : undefined
      };
      const pendingLeaveCount = await LeaveRequest.count({
        where: { employeeId: empId, status: 'PENDING' }
      });

      let pendingLeavesCount = { count: pendingLeaveCount };

      if (pendingLeaveCount === 0) {
        pendingLeavesCount.message = 'No pending leaves';
      }
      // Fetch today’s broadcasts
      const recentBroadcast = await managerService.getTodaysBroadcast();

      return {
        employeeProfile,
        pendingLeavesCount,
        leaveRequestInfo,
        recentBroadcast,
        recentBroadcastCount: recentBroadcast.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DashboardService;