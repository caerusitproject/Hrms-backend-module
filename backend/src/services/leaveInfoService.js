const Leave = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const LeaveInfo = require("../models/LeaveInfo");
const { Op } = require("sequelize");

exports.addOrUpdateLeave = async (employeeId, data) => {
  const emp = await Employee.findByPk(employeeId);
  if (!emp) throw new Error('Employee not found');
  const currentYear = new Date().getFullYear();
  const endDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59)); // Dec 31, 23:59:59 UTC
  const allowedFields = ['earnedLeave', 'casualLeave', 'sickLeave'];
  const filteredData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) filteredData[key] = data[key];
  }
  filteredData.endDate = endDate;
  const existing = await LeaveInfo.findOne({ where: { employeeId } });
  if (existing) {
    await existing.update(filteredData);
    return { message: 'Leave updated successfully', leave: existing };
  }
  const leave = await LeaveInfo.create({ employeeId, ...filteredData });
  return { message: 'Leaves created successfully', leave };
};


exports.getAllLeaveInfo = async () => {
  const leaveInfo= await LeaveInfo.findAll({ include:[{model : Employee , as :'employee',attributes: ['id', 'name', 'empCode', 'email'],},]  });
  if (!Array.isArray(leaveInfo) || leaveInfo.length === 0) { return { message: 'No leave info found', leaveInfo: [] }; }
  return leaveInfo;
};

exports.getLeaveInfoByEmployee = async (employeeId) => {
  const emp= await Employee.findByPk(employeeId);
  if (!emp) throw new Error('Employee not found');
  return LeaveInfo.findOne({ where: { employeeId } });
};

exports.deleteLeaveInfo = async (id) => {
  const deleted = await LeaveInfo.destroy({ where: { id } });
  if (!deleted) throw new Error('Leave info record not found');
  return { message: 'Leave info deleted successfully' };
};