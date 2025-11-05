

jest.mock('../src/services/hrService.js', () => ({
  addEmployee: jest.fn(),
  getHrDashboardData: jest.fn(),
  getAllEmployeesList: jest.fn(),
  getEmployeeProfile: jest.fn(),
  editEmployeeProfile: jest.fn(),
  uploadDocument: jest.fn(),
  getOwnProfile: jest.fn(),
}));

const hrservice = require('../src/services/hrService.js');
const {
  addEmployeeHandler,
  getDashboard,
  getAllEmployees,
  getEmployee,
  editEmployee,
  uploadDocumentHandler,
  getOwnProfileHandler,
} = require('../src/controllers/hrController.js');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('HR Controller - Mocked Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Test: Add Employee
  it('should add employee successfully', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        designation: 'Developer',
        status: 'Active',
        managerId: 'MGR001',
        departmentId: 'D001',
        profile: 'profile.jpg',
      },
    };
    const res = mockResponse();

    const mockEmployee = { id: 'EMP123', ...req.body };
    hrservice.addEmployee.mockResolvedValue(mockEmployee);

    await addEmployeeHandler(req, res);

    expect(hrservice.addEmployee).toHaveBeenCalledWith(
      'John Doe',
      'john@example.com',
      'Developer',
      'Active',
      'MGR001',
      'D001',
      'profile.jpg'
    );
    expect(res.json).toHaveBeenCalledWith(mockEmployee);
  });

  // ✅ Test: Get HR Dashboard
  it('should return HR dashboard data successfully', async () => {
    const req = {};
    const res = mockResponse();

    const mockData = {
      totalEmployees: 10,
      allEmployeesDetails: [],
      upcomingBroadcasts: [],
      upcomingBroadcastsCount: 0,
    };
    hrservice.getHrDashboardData.mockResolvedValue(mockData);

    await getDashboard(req, res);

    expect(hrservice.getHrDashboardData).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  // ✅ Test: Get All Employees
  it('should return all employees successfully', async () => {
    const req = {};
    const res = mockResponse();
    const mockEmployees = [
      { id: 'EMP1', name: 'John' },
      { id: 'EMP2', name: 'Jane' },
    ];

    hrservice.getAllEmployeesList.mockResolvedValue(mockEmployees);

    await getAllEmployees(req, res);

    expect(hrservice.getAllEmployeesList).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(mockEmployees);
  });

  // ✅ Test: Get Employee Profile
  it('should return a single employee profile successfully', async () => {
    const req = { params: { empCode: 'EMP1' } };
    const res = mockResponse();

    const mockProfile = { id: 'EMP1', name: 'John Doe' };
    hrservice.getEmployeeProfile.mockResolvedValue(mockProfile);

    await getEmployee(req, res);

    expect(hrservice.getEmployeeProfile).toHaveBeenCalledWith('EMP1');
    expect(res.json).toHaveBeenCalledWith(mockProfile);
  });

  // ✅ Test: Edit Employee Profile
  it('should edit employee profile successfully', async () => {
    const req = {
      params: { empCode: 'EMP1' },
      body: { designation: 'Senior Developer' },
    };
    const res = mockResponse();

    const mockUpdated = { id: 'EMP1', designation: 'Senior Developer' };
    hrservice.editEmployeeProfile.mockResolvedValue(mockUpdated);

    await editEmployee(req, res);

    expect(hrservice.editEmployeeProfile).toHaveBeenCalledWith('EMP1', { designation: 'Senior Developer' });
    expect(res.json).toHaveBeenCalledWith(mockUpdated);
  });

  // ✅ Test: Upload Document
  it('should upload document successfully', async () => {
    const req = {
      body: { title: 'Policy', content: 'HR policy content', type: 'PDF' },
      user: { id: 'USER123' },
    };
    const res = mockResponse();

    const mockDoc = { id: 1, ...req.body, uploadedBy: 'USER123' };
    hrservice.uploadDocument.mockResolvedValue(mockDoc);

    await uploadDocumentHandler(req, res);

    expect(hrservice.uploadDocument).toHaveBeenCalledWith('Policy', 'HR policy content', 'PDF', 'USER123');
    expect(res.json).toHaveBeenCalledWith(mockDoc);
  });

  // ✅ Test: Get Own Profile
  it('should return logged-in user profile successfully', async () => {
    const req = { user: { id: 'USER001' } };
    const res = mockResponse();

    const mockUser = { id: 'USER001', name: 'HR Manager' };
    hrservice.getOwnProfile.mockResolvedValue(mockUser);

    await getOwnProfileHandler(req, res);

    expect(hrservice.getOwnProfile).toHaveBeenCalledWith('USER001');
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });
});
