const compensationController = require('../src/controllers/payroll/compensationController');
const compensationService = require('../src/services/payroll/compensationService');

// 🔧 Mock the entire service module
jest.mock('../src/services/payroll/compensationService', () => ({
  createOrUpdateCompensation: jest.fn(),
  getCompensationByEmployee: jest.fn(),
  getAllCompensations: jest.fn(),
  getEmployeeList: jest.fn(),
  deleteCompensation: jest.fn(),
}));

describe('CompensationController (Service Mocked)', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // --------------------------------------------------------
  // createOrUpdateCompensation()
  // --------------------------------------------------------
  describe('createOrUpdateCompensation', () => {
    it('should return 400 if employeeId is missing', async () => {
      req.body = { baseSalary: 50000 };

      await compensationController.createOrUpdateCompensation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Employee ID is required' });
      expect(compensationService.createOrUpdateCompensation).not.toHaveBeenCalled();
    });

    it('should call service and return 200 with result', async () => {
      req.body = { employeeId: 1, baseSalary: 50000 };
      const mockResult = { message: 'Compensation created successfully' };
      compensationService.createOrUpdateCompensation.mockResolvedValue(mockResult);

      await compensationController.createOrUpdateCompensation(req, res);

      expect(compensationService.createOrUpdateCompensation).toHaveBeenCalledWith(1, { baseSalary: 50000 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors thrown by service', async () => {
      req.body = { employeeId: 1, baseSalary: 50000 };
      compensationService.createOrUpdateCompensation.mockRejectedValue(new Error('DB Error'));

      await compensationController.createOrUpdateCompensation(req, res);

      expect(compensationService.createOrUpdateCompensation).toHaveBeenCalledWith(1, { baseSalary: 50000 });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB Error' });
    });
  });

  // --------------------------------------------------------
  // getCompensationByEmployee()
  // --------------------------------------------------------
  describe('getCompensationByEmployee', () => {
    it('should return 404 when no compensation found', async () => {
      req.params.employeeId = 1;
      compensationService.getCompensationByEmployee.mockResolvedValue(null);

      await compensationController.getCompensationByEmployee(req, res);

      expect(compensationService.getCompensationByEmployee).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Compensation not found' });
    });

    it('should return 200 with compensation data', async () => {
      req.params.employeeId = 2;
      const mockComp = { id: 1, employeeId: 2, baseSalary: 60000 };
      compensationService.getCompensationByEmployee.mockResolvedValue(mockComp);

      await compensationController.getCompensationByEmployee(req, res);

      expect(compensationService.getCompensationByEmployee).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComp);
    });

    it('should handle service errors gracefully', async () => {
      req.params.employeeId = 3;
      compensationService.getCompensationByEmployee.mockRejectedValue(new Error('Fetch Error'));

      await compensationController.getCompensationByEmployee(req, res);

      expect(compensationService.getCompensationByEmployee).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch Error' });
    });
  });

  // --------------------------------------------------------
  // getAllCompensations()
  // --------------------------------------------------------
  describe('getAllCompensations', () => {
    it('should return 200 with all compensations', async () => {
      const mockComps = [{ id: 1 }, { id: 2 }];
      compensationService.getAllCompensations.mockResolvedValue(mockComps);

      await compensationController.getAllCompensations(req, res);

      expect(compensationService.getAllCompensations).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComps);
    });

    it('should handle service errors', async () => {
      compensationService.getAllCompensations.mockRejectedValue(new Error('DB Fail'));

      await compensationController.getAllCompensations(req, res);

      expect(compensationService.getAllCompensations).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB Fail' });
    });
  });

  // --------------------------------------------------------
  // getEmployeeList()
  // --------------------------------------------------------
  describe('getEmployeeList', () => {
    it('should return 200 with employee list', async () => {
      const mockEmployees = [{ id: 1, name: 'John Doe' }];
      compensationService.getEmployeeList.mockResolvedValue(mockEmployees);

      await compensationController.getEmployeeList(req, res);

      expect(compensationService.getEmployeeList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEmployees);
    });

    it('should handle service errors', async () => {
      compensationService.getEmployeeList.mockRejectedValue(new Error('Service down'));

      await compensationController.getEmployeeList(req, res);

      expect(compensationService.getEmployeeList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service down' });
    });
  });

  // --------------------------------------------------------
  // deleteCompensation()
  // --------------------------------------------------------
  describe('deleteCompensation', () => {
    it('should return 200 after successful deletion', async () => {
      req.params.id = 5;
      const mockResponse = { message: 'Compensation deleted successfully' };
      compensationService.deleteCompensation.mockResolvedValue(mockResponse);

      await compensationController.deleteCompensation(req, res);

      expect(compensationService.deleteCompensation).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle deletion failure', async () => {
      req.params.id = 99;
      compensationService.deleteCompensation.mockRejectedValue(new Error('Not found'));

      await compensationController.deleteCompensation(req, res);

      expect(compensationService.deleteCompensation).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
  });
});
