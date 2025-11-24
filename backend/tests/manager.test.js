// tests/managerController.test.js
const managerService = require('../src/services/managerService.js');
const employeeService = require('../src/services/employeeService.js');
const { getAllBroadcastsOnly } = require('../src/services/broadcastService.js');
const managerController = require('../src/controllers/managerController.js');

jest.mock('../src/services/managerService.js');
jest.mock('../src/services/employeeService.js');
jest.mock('../src/services/broadcastService.js');


describe('Manager Controller', () => {

  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      user: { id: 10 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ✅ Test getTeamList
  describe('getTeamList', () => {
    it('should return team list for a valid manager', async () => {
      const mockTeam = [{ id: 1, name: 'John Doe' }];
      managerService.getTeam.mockResolvedValue(mockTeam);

      await managerController.getTeamList(req, res);

      expect(managerService.getTeam).toHaveBeenCalledWith(req.user.id);
      expect(res.json).toHaveBeenCalledWith(mockTeam);
    });

    it('should handle error when fetching team fails', async () => {
      const error = new Error('Failed to fetch');
      managerService.getTeam.mockRejectedValue(error);

      await managerController.getTeamList(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 401, message: error.message });
    });
  });

  // ✅ Test getEmployeeDetails
  describe('getEmployeeDetails', () => {
    it('should return employee details successfully', async () => {
      const mockProfile = { id: 1, name: 'Alice' };
      req.params.id = 1;
      employeeService.getEmployeeDetailsById.mockResolvedValue(mockProfile);

      await managerController.getEmployeeDetails(req, res);

      expect(employeeService.getEmployeeDetailsById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Employee details retrieved successfully",
        profile: mockProfile,
      });
    });

    it('should handle employee not found', async () => {
      const error = new Error('Employee not found');
      req.params.id = 2;
      employeeService.getEmployeeDetailsById.mockRejectedValue(error);

      await managerController.getEmployeeDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 404, message: error.message });
    });
  });

  // ✅ Test getEmployeeAttendance
describe('getEmployeeAttendance', () => {
  it('should return attendance successfully', async () => {
    req.params.id = 'EMP2316';
    const mockAttendance = { attend: []};
    managerService.getAttendance.mockResolvedValue(mockAttendance);

    await managerController.getEmployeeAttendance(req, res);

    expect(managerService.getAttendance).toHaveBeenCalledWith('EMP2316');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttendance);
  });

  it('should handle service error', async () => {
    req.params.id = 'EMP2396';
    const error = new Error('DB error');
    managerService.getAttendance.mockRejectedValue(error);

    await managerController.getEmployeeAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 500, message: error.message });
  });
});


  // ✅ Test getDashboardBroadcasts
  describe('getDashboardBroadcasts', () => {
    it('should return broadcasts successfully', async () => {
      req.query.page = 1;
      req.query.limit = 10;
      const mockBroadcasts = [{ id: 1, title: 'Announcement' }];
      getAllBroadcastsOnly.mockResolvedValue(mockBroadcasts);

      await managerController.getDashboardBroadcasts(req, res);

      expect(getAllBroadcastsOnly).toHaveBeenCalledWith(1, 10);
      expect(res.json).toHaveBeenCalledWith(mockBroadcasts);
    });

    it('should return 400 if limit invalid', async () => {
      req.query.limit = 200;
      req.query.page = 1;

      await managerController.getDashboardBroadcasts(req, res);

      expect(res.json).toHaveBeenCalledWith(400);
    });

    it('should return 400 if page invalid', async () => {
      req.query.limit = 10;
      req.query.page = 0;

      await managerController.getDashboardBroadcasts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ✅ Test getDashboard
  describe('getDashboard', () => {
    it('should return dashboard data successfully', async () => {
      req.user.id = 7;
      const mockData = {
        totalTeamMembers: 2,
        teamMembers: [],
        pendingLeaves: [],
        recentBroadcast: [],
      };
      managerService.getDashboardData.mockResolvedValue(mockData);

      await managerController.getDashboard(req, res);

      expect(managerService.getDashboardData).toHaveBeenCalledWith(7);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });
});
