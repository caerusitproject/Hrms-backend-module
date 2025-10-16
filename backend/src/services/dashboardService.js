const Employee = require('../models/Employee.js');
const LeaveRequest = require('../models/LeaveRequest.js');
const Attendance = require('../models/Attendance.js');
const Broadcast = require('../models/Broadcast.js');
const { Op } = require('sequelize');
const managerService = require('./managerService.js');


/*const getHrDashboardData = async () => {
  try {
    const totalEmployees = await Employee.count();
    const allEmployeesDetails = await Employee.findAll({
      attributes: ['id', 'name','email', 'designation', 'status']
    });
    const upcomingBroadcasts = await Broadcast.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(2025, 10, 15) // October 14, 2025
        }
      },
      order: [['createdAt', 'ASC']]
    });
    const upcomingBroadcastsCount = upcomingBroadcasts.length;
    return { totalEmployees, allEmployeesDetails, upcomingBroadcasts, upcomingBroadcastsCount };
  } catch (error) {
    throw new Error('Failed to fetch HR dashboard data');
  }
};

const getManagerDashboardData = async (managerId) => {
  try {
    const teamMembers = await managerService.getTeam(managerId);
    const totalTeamMembers = await managerService.getTeamCount(managerId);
    const pendingLeaves = await managerService.getPendingLeaves(managerId);
    const recentBroadcast = await managerService.getTodaysBroadcast();
    return { totalTeamMembers, teamMembers, pendingLeaves, recentBroadcast };
  } catch (error) {
    throw new Error('Failed to fetch manager dashboard data');
  }
};

const getEmployeeDashboardData = async(empId) =>{
    try {
      // Fetch employee profile
      const employeeProfile = await Employee.findByPk(empId, {
        attributes: ['id','managerId', 'name', 'email', 'designation', 'status'],
        include: [
          /*{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          },*/
          /*{
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

      //count of pending Leaves
      const pendingLeaveCount = await LeaveRequest.count({
        where: { employeeId: empId, status: 'PENDING'}
      });

      // Fetch recent broadcasts (from today onwards)
      const recentBroadcast = await managerService.getTodaysBroadcast();
      return {
        employeeProfile,
        pendingLeaveCount,
        leaveRequests,
        recentBroadcast
      };
    } catch (error) {
      throw new Error('Failed to fetch employee dashboard data');
    }
  }


module.exports = { getHrDashboardData, getManagerDashboardData, getEmployeeDashboardData };*/


class DashboardService {
  static async getHrDashboardData() {
    try {
      const totalEmployees = await Employee.count();

      const allEmployeesDetails = await Employee.findAll({
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

      const upcomingBroadcastsCount = upcomingBroadcasts.length;

      return { totalEmployees, allEmployeesDetails, upcomingBroadcasts, upcomingBroadcastsCount };
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

      // Count of pending leaves
      const pendingLeaveCount = await LeaveRequest.count({
        where: { employeeId: empId, status: 'PENDING' }
      });

      // Fetch today’s broadcasts
      const recentBroadcast = await managerService.getTodaysBroadcast();

      return {
        employeeProfile,
        pendingLeaveCount,
        leaveRequests,
        recentBroadcast,
        recentBroadcastCount: recentBroadcast.length
      };
    } catch (error) {
      throw new Error('Failed to fetch employee dashboard data');
    }
  }
}

module.exports = DashboardService;