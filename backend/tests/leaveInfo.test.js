

jest.mock('../src/services/leaveInfoService', () => ({
  addOrUpdateLeave: jest.fn(),
  getAllLeaveInfo: jest.fn(),
  getLeaveInfoByEmployee: jest.fn(),
  deleteLeaveInfo: jest.fn(),
}));

const leaveInfoService = require('../src/services/leaveInfoService');
const {
  addOrUpdateLeave,
  getAllLeaveInfo,
  getLeaveInfoByEmployee,
  deleteLeaveInfo,
} = require('../src/controllers/leaveInfoController');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Leave Info Controller (Mocked Service)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Test: addOrUpdateLeave
  describe('addOrUpdateLeave', () => {
    it('should return 400 if employeeId is missing', async () => {
      const req = { body: { casualLeave: 2 } };
      const res = mockResponse();

      await addOrUpdateLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 400,
        message: 'Employee ID is required',
      });
      expect(leaveInfoService.addOrUpdateLeave).not.toHaveBeenCalled();
    });

    it('should add or update leave successfully', async () => {
      const req = { body: { employeeId: 1, earnedLeave: 5 } };
      const res = mockResponse();

      const mockLeave = { message: 'Leaves added successfully', leave: { employeeId: 1 } };
      leaveInfoService.addOrUpdateLeave.mockResolvedValue(mockLeave);

      await addOrUpdateLeave(req, res);

      expect(leaveInfoService.addOrUpdateLeave).toHaveBeenCalledWith(1, { earnedLeave: 5 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Leaves added successfully',
        leaveInfo: mockLeave,
      });
    });

    it('should handle service errors gracefully', async () => {
      const req = { body: { employeeId: 1, earnedLeave: 5 } };
      const res = mockResponse();

      leaveInfoService.addOrUpdateLeave.mockRejectedValue(new Error('Database error'));

      await addOrUpdateLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: 'Database error',
      });
    });
  });

  // ✅ Test: getAllLeaveInfo
  describe('getAllLeaveInfo', () => {
    it('should return all leave info successfully', async () => {
      const req = {};
      const res = mockResponse();

      const mockData = [{ id: 1, earnedLeave: 5 }];
      leaveInfoService.getAllLeaveInfo.mockResolvedValue(mockData);

      await getAllLeaveInfo(req, res);

      expect(leaveInfoService.getAllLeaveInfo).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Leaves data retrieved successfully',
        leaveInfoList: mockData,
      });
    });

    it('should handle internal errors', async () => {
      const req = {};
      const res = mockResponse();

      leaveInfoService.getAllLeaveInfo.mockRejectedValue(new Error('Internal error'));

      await getAllLeaveInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal error' });
    });
  });

  // ✅ Test: getLeaveInfoByEmployee
  describe('getLeaveInfoByEmployee', () => {
    it('should return leave info successfully', async () => {
      const req = { params: { id: 1 } };
      const res = mockResponse();

      const mockLeave = { id: 1, earnedLeave: 5 };
      leaveInfoService.getLeaveInfoByEmployee.mockResolvedValue(mockLeave);

      await getLeaveInfoByEmployee(req, res);

      expect(leaveInfoService.getLeaveInfoByEmployee).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Leave info retrieved successfully',
        leaveInfo: mockLeave,
      });
    });

    it('should return 404 when leave info not found', async () => {
      const req = { params: { id: 2 } };
      const res = mockResponse();

      leaveInfoService.getLeaveInfoByEmployee.mockResolvedValue(null);

      await getLeaveInfoByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Leave records not found for the employee',
      });
    });

    it('should handle internal errors gracefully', async () => {
      const req = { params: { id: 3 } };
      const res = mockResponse();

      leaveInfoService.getLeaveInfoByEmployee.mockRejectedValue(new Error('Database error'));

      await getLeaveInfoByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  // ✅ Test: deleteLeaveInfo
  describe('deleteLeaveInfo', () => {
    it('should delete leave info successfully', async () => {
      const req = { params: { id: 1 } };
      const res = mockResponse();

      const mockResponseData = { message: 'Leave info deleted successfully' };
      leaveInfoService.deleteLeaveInfo.mockResolvedValue(mockResponseData);

      await deleteLeaveInfo(req, res);

      expect(leaveInfoService.deleteLeaveInfo).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponseData);
    });

    it('should handle service errors', async () => {
      const req = { params: { id: 5 } };
      const res = mockResponse();

      leaveInfoService.deleteLeaveInfo.mockRejectedValue(new Error('Record not found'));

      await deleteLeaveInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record not found' });
    });
  });
});
