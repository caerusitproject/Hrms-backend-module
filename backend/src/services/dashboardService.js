const Employee = require('../models/Employee.js');
const LeaveRequest = require('../models/LeaveRequest.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op, where } = require('sequelize');
const managerService = require('./managerService.js');
const { stat } = require('fs');

class DashboardService {

  static async getHrDashboardData() {
    logger.info("Fetching HR dashboard data");
    try {
      const totalEmployees = await Employee.count();
      logger.info(`Total employees: ${totalEmployees}`);

      const allEmployeesDetails = await Employee.findAll({
        where: { status: 'Active' },
        attributes: ['id', 'name',  'email', 'designation','status']
      });
      logger.info(`Fetched details of all active employees`);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today

      const upcomingBroadcasts = await managerService.getTodaysBroadcast();
      if (!upcomingBroadcasts) {
        logger.error('Error in retrieving broadcasts found');
        throw new Error('Error in retrieving broadcasts found');
      }
      logger.info(`Number of upcoming broadcasts: ${upcomingBroadcasts.length}`);
      const upcomingBroadcastsCount = upcomingBroadcasts.length;

      return { totalEmployees, upcomingBroadcasts,allEmployeesDetails, upcomingBroadcastsCount };
    } catch (error) {
      logger.error('Failed to fetch HR dashboard data', error);
      throw new Error('Failed to fetch HR dashboard data');
    }
  }

  static async getManagerDashboardData(managerId) {
    logger.info(`Fetching dashboard data for manager ID: ${managerId}`);
    try {
      const teamMembers = await managerService.getTeam(managerId);
      const totalTeamMembers = await managerService.getTeamCount(managerId);
      const pendingLeaves = await managerService.getPendingLeaves(managerId);
      const recentBroadcast = await managerService.getTodaysBroadcast();
      logger.info(`Number of recent broadcasts for manager ID ${managerId}: ${recentBroadcast.length}`);
      return { totalTeamMembers, teamMembers, pendingLeaves, recentBroadcast };
    } catch (error) {
      logger.error('❌ Failed to fetch manager dashboard data', error);
      throw new Error('Failed to fetch manager dashboard data');
    }
  }

  static async getEmployeeDashboardData(empId) {
    logger.info(`Fetching dashboard data for employee ID: ${empId}`);
    try {
      // Fetch employee profile
      logger.info(`Fetching profile for employee ID: ${empId}`);
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

      logger.info(`Fetching leave requests for employee ID: ${empId}`);
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
      logger.info(`Fetching today's broadcasts for employee ID: ${empId}`);
      const recentBroadcast = await managerService.getTodaysBroadcast();

      return {
        employeeProfile,
        pendingLeavesCount,
        leaveRequestInfo,
        upcomingBroadcasts,
        upcomingBroadcastsCount: upcomingBroadcasts.length
      };
    } catch (error) {
      logger.error('❌ Failed to fetch employee dashboard data', error);
       throw new Error('Failed to fetch employee dashboard data');
    }
  }
}

module.exports = DashboardService;