const payrollController = require('../src/controllers/payroll/payrollController');
const payrollService = require('../src/services/payroll/payrollService');

jest.mock('../src/services/payroll/payrollService'); // ✅ Mock the service layer

describe('PayrollController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // 🧪 finalizePayroll()
  describe('finalizePayroll', () => {
    it('should return 400 if monthyear is missing', async () => {
      await payrollController.finalizePayroll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Month (MM-YYYY) is required' });
    });

    it('should finalize payroll successfully', async () => {
      req.body.monthyear = '03-2025';
      const mockResult = { processed: 5, employees: [{ id: 1, name: 'Alice' }] };

        payrollService.finalizePayrollForMonth.mockResolvedValue(mockResult);

        await payrollController.finalizePayroll(req, res);

        expect(payrollService.finalizePayrollForMonth).toHaveBeenCalledWith('03', '2025');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Payroll finalized for 03-2025',
        summary: { processedEmployees: 5 },
        details: mockResult.employees,
        });
    });

    it('should handle errors properly', async () => {
        req.body.monthyear = '03-2025';
        payrollService.finalizePayrollForMonth.mockRejectedValue(new Error('Database error'));

        await payrollController.finalizePayroll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error',
        });
    });
  });

  // 🧪 generatePayrollForEmployee()
  describe('generatePayrollForEmployee', () => {
    it('should return 400 if payrollIds are missing', async () => {
      req.body = {};
      await payrollController.generatePayrollForEmployee(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'payrollIds are required. Please enter valid data',
      });
    });

    it('should return 400 if payrollIds is not an array', async () => {
      req.body = { payrollIds: 'notArray' };
      await payrollController.generatePayrollForEmployee(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'payrollIds must be an array',
      });
    });

    it('should generate payroll successfully', async () => {
      req.body = { payrollIds: [1, 2, 3] };
      const mockResult = { message: 'Processed payrolls', results: [] };
      payrollService.processPayroll.mockResolvedValue(mockResult);

      await payrollController.generatePayrollForEmployee(req, res);

      expect(payrollService.processPayroll).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: mockResult,
      }));
    });
  });

  // 🧪 getAllPayrolls()
  describe('getAllPayrolls', () => {
    it('should return all payrolls', async () => {
            const payrolls = [{ id: 1 }, { id: 2 }];

        // ✅ FIX: use mockResolvedValue, not mockResult
        payrollService.getAllPayrolls.mockResolvedValue(payrolls);

        await payrollController.getAllPayrolls(req, res);

        expect(payrollService.getAllPayrolls).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            count: payrolls.length,
            data: payrolls,
        });
    });

    it('should handle errors', async () => {
      payrollService.getAllPayrolls.mockRejectedValue(new Error('Database failure'));

    await payrollController.getAllPayrolls(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Database failure',
    });
  });
})

  // 🧪 getPayrollByEmployee()
  describe('getPayrollByEmployee', () => {
    it('should return 404 if payroll not found', async () => {
      req.params = { employeeId: '1', month: '03-2025' };
     
      //payrollService.getPayrollByEmployee.mockResolvedValue(null);

      await payrollController.getPayrollByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Payroll record not found' });
    });

    it('should return payroll data successfully', async () => {
      const payroll = { id: 1, employeeId: 'E001' };
      req.params = { employeeId: 'E001', month: '03-2025' };
      payrollService.getPayrollByEmployee.mockResolvedValue(payroll);

      await payrollController.getPayrollByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: payroll,
      });
    });
  });

  // 🧪 getNotGenerated()
  describe('getNotGenerated', () => {
    it('should return message if no pending payrolls found', async () => {
      payrollService.getNotGenerated.mockResolvedValue([]);
      await payrollController.getNotGenerated(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No Pending emplyee payroll slip found!',
      });
    });

    it('should return pending payrolls', async () => {
      const mockData = [{ id: 1, status: 'NOT CREATED' }];
      payrollService.getNotGenerated.mockResolvedValue(mockData);
      await payrollController.getNotGenerated(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockData,
      });
    });
  });

  // 🧪 getCreated()
  describe('getCreated', () => {
    it('should return message if no created slips found', async () => {
      payrollService.getCreated.mockResolvedValue([]);
      await payrollController.getCreated(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No created employee slip found!',
      });
    });

    it('should return created slips', async () => {
      const mockData = [{ id: 1, status: 'Created' }];
      payrollService.getCreated.mockResolvedValue(mockData);
      await payrollController.getCreated(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockData,
      });
    });
  });

  // 🧪 getFilteredPayrolls()
  describe('getFilteredPayrolls', () => {
    it('should return 400 if query params are missing', async () => {
      req.query = {};
      await payrollController.getFilteredPayrolls(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide both 'monthType' (current/previous) and 'status' (Created/NOT CREATED)",
      });
    });

    it('should return success when filtered payrolls are found', async () => {
      req.query = { monthType: 'current', status: 'Created' };
      const mockPayrolls = [{ id: 1 }];
      payrollService.getFilteredPayrolls.mockResolvedValue(mockPayrolls);

      await payrollController.getFilteredPayrolls(req, res);

      expect(payrollService.getFilteredPayrolls).toHaveBeenCalledWith('current', 'Created');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        count: 1,
        data: mockPayrolls,
      });
    });

    it('should handle no payrolls found case', async () => {
      req.query = { monthType: 'current', status: 'Created' };
      payrollService.getFilteredPayrolls.mockResolvedValue([]);
      await payrollController.getFilteredPayrolls(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: `No payrolls found for current month with status Created.`,
      });
    });
  });
});
