const Employee = require('../models/Employee.js');
const Broadcast = require('../models/Broadcast.js');
const Document = require('../models/Document.js');
const User = require('../models/User.js');
const { Op } = require('sequelize');

const addEmployee = async (name, email, designation, status, managerId, departmentId, profile) => {
  return await Employee.create({ id: `EMP${Date.now()}`, name, email, designation, status, managerId, departmentId, profile });
};

const getTotalEmployees = async () => Employee.count();

const getAllEmployeesDetails = async () => {
  return await Employee.findAll({
    attributes: ['name', 'designation', 'status']
  });
};

const getUpcomingBroadcasts = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time to midnight

  return await Broadcast.findAll({
    where: {
      createdAt: {
        [Op.gte]: today
      }
    },
    order: [['createdAt', 'ASC']]
  });
};


const getHrDashboardData = async () => {
  const totalEmployees = await getTotalEmployees();
  const allEmployeesDetails = await getAllEmployeesDetails();
  const upcomingBroadcasts = await getUpcomingBroadcasts();
  const upcomingBroadcastsCount = upcomingBroadcasts.length;
  return { totalEmployees, allEmployeesDetails, upcomingBroadcasts, upcomingBroadcastsCount };
};

const getAllEmployeesList = async () => Employee.findAll();

const getEmployeeProfile = async (empCode) => Employee.findByPk(empCode);

const editEmployeeProfile = async (empCode, updates) => {
  const employee = await Employee.findByPk(empCode);
  if (!employee) throw new Error('Employee not found');
  Object.assign(employee, updates);
  await employee.save();
  return employee;
};

const uploadDocument = async (title, content, type, uploadedBy) => {
  return await Document.create({ title, content, type, uploadedBy });
};

const getOwnProfile = async (userId) => User.findByPk(userId);

module.exports = { addEmployee, getHrDashboardData, getAllEmployeesList, getEmployeeProfile, editEmployeeProfile, uploadDocument, getOwnProfile };