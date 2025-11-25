
const dashboardController = require('../src/controllers/dashboardController.js');
const managerService = require('../src/services/managerService.js');

const Employee = require('../src/models/Employee.js');
const LeaveRequest = require('../src/models/LeaveRequest.js');
const Attendance = require('../src/models/Attendance.js');
const Broadcast = require('../src/models/Broadcast.js');

// ===== MOCK DEPENDENCIES =====
jest.mock('../src/models/Employee.js', () => ({
  count: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));
jest.mock('../src/models/LeaveRequest.js', () => ({
  findAll: jest.fn(),
  count: jest.fn(),
}));
jest.mock('../src/models/Attendance.js', () => ({}));
jest.mock('../src/models/Broadcast.js', () => ({
  findAll: jest.fn(),
}));
jest.mock('../src/services/managerService.js', () => ({
  getTeam: jest.fn(),
  getTeamCount: jest.fn(),
  getPendingLeaves: jest.fn(),
  getTodaysBroadcast: jest.fn(),
}));

jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

const dashboardService = require('../src/services/dashboardService.js');

describe('Dashboard Service & Controller', () => {

  // ======== SERVICE TESTS ========

  describe('getHrDashboardData()', () => {
    it('should return HR dashboard data successfully', async () => {
      Employee.count.mockResolvedValue(10);
      const mockEmployees = [{ id: 1, name: 'John', status: 'Active' }];
      Employee.findAll.mockResolvedValue(mockEmployees);

      const mockBroadcasts = [{ id: 1, title: 'Notice' }];
      Broadcast.findAll.mockResolvedValue(mockBroadcasts);

      const result = await dashboardService.getHrDashboardData();

      expect(Employee.count).toHaveBeenCalled();
      expect(Employee.findAll).toHaveBeenCalledWith({
        where: { status: 'Active' },
        attributes: ['id', 'name', 'email', 'designation', 'status']
      });
      expect(Broadcast.findAll).toHaveBeenCalled();
      expect(result.totalEmployees).toBe(10);
      expect(result.allEmployeesDetails).toEqual(mockEmployees);
      expect(result.upcomingBroadcasts).toEqual(mockBroadcasts);
      expect(result.upcomingBroadcastsCount).toBe(1);
    });

    it('should throw error if Broadcast.findAll returns null', async () => {
      Employee.count.mockResolvedValue(10);
      Employee.findAll.mockResolvedValue([{ id: 1 }]);
      Broadcast.findAll.mockResolvedValue(null);

      await expect(dashboardService.getHrDashboardData())
        .rejects.toThrow('Failed to fetch HR dashboard data');
    });

    it('should handle internal failure', async () => {
      Employee.count.mockRejectedValue(new Error('DB Error'));
      await expect(dashboardService.getHrDashboardData())
        .rejects.toThrow('Failed to fetch HR dashboard data');
    });
  });

  describe('getManagerDashboardData()', () => {
    it('should return manager dashboard data successfully', async () => {
      managerService.getTeam.mockResolvedValue([{ id: 1, name: 'Emp1' }]);
      managerService.getTeamCount.mockResolvedValue(2);
      managerService.getPendingLeaves.mockResolvedValue([{ id: 99 }]);
      managerService.getTodaysBroadcast.mockResolvedValue([{ id: 3 }]);

      const result = await dashboardService.getManagerDashboardData(10);

      expect(managerService.getTeam).toHaveBeenCalledWith(10);
      expect(result.totalTeamMembers).toBe(2);
      expect(result.recentBroadcast).toEqual([{ id: 3 }]);
    });

    it('should handle failure', async () => {
      managerService.getTeam.mockRejectedValue(new Error('Error'));
      await expect(dashboardService.getManagerDashboardData(1))
        .rejects.toThrow('Failed to fetch manager dashboard data');
    });
  });

  describe('getEmployeeDashboardData()', () => {
   it('should return employee dashboard successfully', async () => {
    const mockEmployee = { id: 1, name: 'John' };
    Employee.findByPk.mockResolvedValue(mockEmployee);

    const mockLeaves = [{ id: 1, reason: 'Sick' }];
    LeaveRequest.findAll.mockResolvedValue(mockLeaves);
    LeaveRequest.count.mockResolvedValue(1);
    managerService.getTodaysBroadcast.mockResolvedValue([{ id: 1, title: 'Notice' }]);

    const result = await dashboardService.getEmployeeDashboardData(1);
    expect(result.employeeProfile).toEqual(mockEmployee);
    expect(result.recentBroadcastCount).toBe(1);
  });

    it('should handle case when no leave requests', async () => {
      Employee.findByPk.mockResolvedValue({ id: 1 });
      LeaveRequest.findAll.mockResolvedValue([]);
      LeaveRequest.count.mockResolvedValue(0);
      managerService.getTodaysBroadcast.mockResolvedValue([]);

      const result = await dashboardService.getEmployeeDashboardData(1);
     // expect(result.leaveRequests.message).toBe("");
    });

    it('should handle service failure', async () => {
      Employee.findByPk.mockRejectedValue(new Error('DB Error'));
      await expect(dashboardService.getEmployeeDashboardData(1))
        .rejects.toThrow('Failed to fetch employee dashboard data');
    });
  });

  // ======== CONTROLLER TESTS ========

  describe('hrDashboard()', () => {
    it('should send HR dashboard data', async () => {
      const mockData = { totalEmployees: 10 };
      jest.spyOn(dashboardService, 'getHrDashboardData').mockResolvedValue(mockData);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await dashboardController.hrDashboard(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle error', async () => {
      jest.spyOn(dashboardService, 'getHrDashboardData').mockRejectedValue(new Error('Fail'));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await dashboardController.hrDashboard({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch HR dashboard data' });
    });
  });

  describe('managerDashboard()', () => {
    it('should return manager dashboard data', async () => {
      const mockData = { totalTeamMembers: 5 };
      jest.spyOn(dashboardService, 'getManagerDashboardData').mockResolvedValue(mockData);

      const req = { user: { id: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await dashboardController.managerDashboard(req, res);
      expect(dashboardService.getManagerDashboardData).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle manager error', async () => {
      jest.spyOn(dashboardService, 'getManagerDashboardData').mockRejectedValue(new Error('Fail'));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await dashboardController.managerDashboard({ user: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch manager dashboard data' });
    });
  });

  describe('employeeDashboard()', () => {
    it('should return employee dashboard data', async () => {
      const mockData = { employeeProfile: { id: 1 } };
      jest.spyOn(dashboardService, 'getEmployeeDashboardData').mockResolvedValue(mockData);
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await dashboardController.employeeDashboard(req, res);
      expect(dashboardService.getEmployeeDashboardData).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle employee dashboard error', async () => {
      jest.spyOn(dashboardService, 'getEmployeeDashboardData').mockRejectedValue(new Error('Fail'));
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await dashboardController.employeeDashboard({ user: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch employee dashboard data' });
    });
  });
});
