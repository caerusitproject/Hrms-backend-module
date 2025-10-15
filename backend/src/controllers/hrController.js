const { addEmployee, getHrDashboardData, getAllEmployeesList, getEmployeeProfile, editEmployeeProfile, uploadDocument, getOwnProfile } = require('../services/hrService.js');

const addEmployeeHandler = async (req, res) => {
  const { name, email, designation, status, managerId, departmentId, profile } = req.body;
  const employee = await addEmployee(name, email, designation, status, managerId, departmentId, profile);
  res.json(employee);
};

const getDashboard = async (req, res) => {
  const data = await getHrDashboardData();
  res.json(data);
};

const getAllEmployees = async (req, res) => {
  const employees = await getAllEmployeesList();
  res.json(employees);
};

const getEmployee = async (req, res) => {
  const profile = await getEmployeeProfile(req.params.empCode);
  res.json(profile);
};

const editEmployee = async (req, res) => {
  const updates = req.body;
  const employee = await editEmployeeProfile(req.params.empCode, updates);
  res.json(employee);
};

const uploadDocumentHandler = async (req, res) => {
  const { title, content, type } = req.body;
  const uploadedBy = req.user.id;
  const document = await uploadDocument(title, content, type, uploadedBy);
  res.json(document);
};

const getOwnProfileHandler = async (req, res) => {
  const profile = await getOwnProfile(req.user.id);
  res.json(profile);
};

module.exports = { addEmployeeHandler, getDashboard, getAllEmployees, getEmployee, editEmployee, uploadDocumentHandler, getOwnProfileHandler };