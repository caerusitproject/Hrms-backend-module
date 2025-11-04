// ✅ Ensure test environment for Jest
/*process.env.NODE_ENV = 'test';

// ✅ ABSOLUTE PATH STRINGS — No variables in jest.mock()
jest.mock(path.resolve(__dirname, '../src/middleware/authMiddleware.js'), () => {
  return (req, res, next) => {
    const auth = req.headers['authorization'] || '';
    if (auth !== 'Bearer test-token') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { id: 1, role: 'ADMIN' };
    next();
  };
});

jest.mock(path.resolve(__dirname, '../src/middleware/authMiddleware.js'), () => ({
  login: jest.fn(({ email, password }) =>
    email === 'test@test.com' && password === '123456'
      ? { token: 'test-token' }
      : null
  ),
}));

jest.mock('../src/services/employeeService.js', () => ({
  getAllEmployees: jest.fn(() => [{ id: 1, name: 'John Doe', salary: 30000 }]),
  getEmployeeById: jest.fn((id) =>
    id == 1
      ? {
          id: 1,
          name: 'John Doe',
          salary: 30000,
          phone: '9999999999',
        }
      : null
  ),
  createEmployee: jest.fn((data) => ({ id: 2, ...data })),
  updateEmployee: jest.fn((id, data) =>
    id == 1 ? { id: 1, ...data } : null
  ),
  deleteEmployee: jest.fn((id) => id == 1),
}));

jest.mock('../src/services/departmentService.js', () => ({
  getAllDepartments: jest.fn(() => [{ id: 1, name: 'IT' }]),
}));

jest.mock('../src/services/roleService.js', () => ({
  getRoles: jest.fn(() => [{ id: 1, name: 'Admin' }]),
}));

jest.mock('../src/services/leaveService.js', () => ({
  applyLeave: jest.fn((data) =>
    data.employeeId ? { leaveId: 101, status: 'PENDING' } : null
  ),
}));

jest.mock('../src/services/attendanceService.js', () => ({
  markAttendance: jest.fn((data) =>
    data.employeeId ? { attendanceId: 501, status: 'PRESENT' } : null
  ),
}));
/*
jest.mock('../src/services/payrollService.js', () => ({
  generatePayroll: jest.fn((data) =>
    data.employeeId ? { payrollId: 201, netSalary: 45000 } : null
  ),
}));
*/
// ✅ Avoid real DB, Kafka, SMTP, Cache
/*jest.mock('pg');
jest.mock('kafkajs');
jest.mock('nodemailer');

// ✅ Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});*/
