// tests/compensationService.test.js
const Compensation = require('../src/models/payroll/compensation');
const Employee = require('../src/models/Employee');
const { Op } = require('sequelize');
const service = require('../src/services/payroll/compensationService'); 

jest.mock('../src/models/payroll/compensation');
jest.mock('../src/models/Employee');

describe('Compensation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ createOrUpdateCompensation
  describe('createOrUpdateCompensation', () => {
    it('should create a new compensation when none exists', async () => {
      const employeeId = 1;
      const data = { baseSalary: 10000 };

      const mockEmp = { id: 1, name: 'John' };
      const mockComp = { id: 1, employeeId, baseSalary: 10000 };

      Employee.findByPk.mockResolvedValue(mockEmp);
      Compensation.findOne.mockResolvedValue(null);
      Compensation.create.mockResolvedValue(mockComp);

      const result = await service.createOrUpdateCompensation(employeeId, data);

      expect(Employee.findByPk).toHaveBeenCalledWith(employeeId);
      expect(Compensation.create).toHaveBeenCalled();
      expect(result.message).toBe('Compensation created successfully');
      expect(result.compensation).toEqual(mockComp);
    });

    it('should update an existing compensation', async () => {
      const employeeId = 2;
      const data = { baseSalary: 20000, hra: 4000 };
      const mockEmp = { id: 2 };
      const mockComp = { update: jest.fn().mockResolvedValue(true) };

      Employee.findByPk.mockResolvedValue(mockEmp);
      Compensation.findOne.mockResolvedValue(mockComp);

      const result = await service.createOrUpdateCompensation(employeeId, data);

      expect(mockComp.update).toHaveBeenCalled();
      expect(result.message).toBe('Compensation updated successfully');
    });

    it('should throw error if employee not found', async () => {
      Employee.findByPk.mockResolvedValue(null);
      await expect(service.createOrUpdateCompensation(999, {})).rejects.toThrow('Employee not found');
    });

    it('should auto-fill defaults when partial data provided', async () => {
      const employeeId = 3;
      const data = { baseSalary: 5000 };
      const mockEmp = { id: 3 };
      const mockComp = { id: 1, employeeId: 3 };

      Employee.findByPk.mockResolvedValue(mockEmp);
      Compensation.findOne.mockResolvedValue(null);
      Compensation.create.mockResolvedValue(mockComp);

      await service.createOrUpdateCompensation(employeeId, data);

      const args = Compensation.create.mock.calls[0][0];
      expect(args.hra).toBeDefined();
      expect(args.hra).toBeGreaterThan(0);
      expect(args.remarks).toBe('Auto-generated compensation structure');
    });
  });

  // ✅ getCompensationByEmployee
  describe('getCompensationByEmployee', () => {
    it('should return compensation by employee ID', async () => {
      const mockData = { id: 1, employeeId: 1 };
      Compensation.findOne.mockResolvedValue(mockData);

      const result = await service.getCompensationByEmployee(1);

      expect(Compensation.findOne).toHaveBeenCalledWith({ where: { employeeId: 1 } });
      expect(result).toEqual(mockData);
    });
  });

  // ✅ getAllCompensations
  describe('getAllCompensations', () => {
    it('should return all compensations with employees', async () => {
      const mockList = [{ id: 1 }, { id: 2 }];
      Compensation.findAll.mockResolvedValue(mockList);

      const result = await service.getAllCompensations();

      expect(Compensation.findAll).toHaveBeenCalledWith({ include: Employee });
      expect(result).toEqual(mockList);
    });
  });

  // ✅ getEmployeeList
  describe('getEmployeeList', () => {
    it('should return active employees not in compensation list', async () => {
      const mockCompensations = [{ employeeId: 1 }, { employeeId: 2 }];
      const mockEmployees = [{ id: 3, name: 'Bob' }];

      Compensation.findAll.mockResolvedValue(mockCompensations);
      Employee.findAll.mockResolvedValue(mockEmployees);

      const result = await service.getEmployeeList();

      expect(Compensation.findAll).toHaveBeenCalledWith({ attributes: ['employeeId'] });
      expect(Employee.findAll).toHaveBeenCalledWith({
        where: {
          status: 'Active',
          id: { [Op.notIn]: [1, 2] },
        },
        attributes: ['id', 'name', 'email', 'departmentId', 'designation', 'empCode'],
      });
      expect(result).toEqual(mockEmployees);
    });
  });

  // ✅ deleteCompensation
  describe('deleteCompensation', () => {
    it('should delete compensation successfully', async () => {
      Compensation.destroy.mockResolvedValue(1);

      const result = await service.deleteCompensation(5);

      expect(Compensation.destroy).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(result).toEqual({ message: 'Compensation deleted successfully' });
    });

    it('should throw error if record not found', async () => {
      Compensation.destroy.mockResolvedValue(0);

      await expect(service.deleteCompensation(10)).rejects.toThrow('Compensation not found');
    });
  });
});
