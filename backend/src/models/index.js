const db = require("../db"); // this is your pg client/connection

// Import models
const Employee = require("../models/Employee");
const EmpFinancialInfo = require('./empFinanceInfo');
const Upload = require("../models/uploadModel");
const Attendance = require("../models/Attendance");
const Role = require("./Role");
const User = require("./User");
const leaveRequest = require("./LeaveRequest");

User.belongsToMany(Role, { through: "UserRoles" });
Role.belongsToMany(User, { through: "UserRoles" });

// Export them so services/controllers can use like: db.Employee.find..., etc.
module.exports = {
  db,
  Employee,
  EmpFinancialInfo,
  Upload,
  Attendance,
  Role,
  User,
  leaveRequest

};