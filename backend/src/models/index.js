

const db = require("../db"); // this is your pg client/connection
const dbInfo = {}

dbInfo.Sequelize = db.Sequelize
dbInfo.Sequelize = db.Sequelize


// Import models
dbInfo.Employee = require("./Employee");
dbInfo.Department = require("./department");
dbInfo.EmpFinancialInfo = require('./empFinanceInfo');
dbInfo.Attendance = require("./Attendance");
dbInfo.Role = require("./Role");
dbInfo.User = require("./User");
dbInfo.leaveRequest = require("./LeaveRequest");

dbInfo.Upload = require("./uploadModel");
dbInfo.RefreshToken = require("./RefreshToken");
dbInfo.Leave = require('./LeaveRequest');



//dbInfo.Department.hasMany(dbInfo.Employee, { foreignKey: "departmentId", as: "employees" });
dbInfo.Employee.belongsTo(dbInfo.Department, { foreignKey: "departmentId", as: "department" });
//dbInfo.Employee.belongsTo(dbInfo.Department, { foreignKey: "DepartmentId", as: "dept" });
//dbInfo.Department.hasMany(dbInfo.Employee, { foreignKey: "departmentId", as: "employee" },{onDelete: 'CASCADE', hooks: true})
dbInfo.Employee.belongsTo(dbInfo.Upload, { foreignKey: "id", as: "image" });
dbInfo.Upload.belongsTo(dbInfo.Employee,{foreignKey: "employee_id", as: "employee"},{onDelete: 'CASCADE', hooks: true});


//dbInfo.Employee.belongsTo(dbInfo.Employee, { as: "emp_manager", foreignKey: "managerId" });
//dbInfo.Employee.hasMany(dbInfo.Employee, { as: "employee", foreignKey: "managerId" });

dbInfo.User.belongsTo(dbInfo.Role, { foreignKey: "roleId", as: "role" });
dbInfo.Role.hasMany(dbInfo.User, { foreignKey: "roleId", as: "users" });

dbInfo.User.hasMany(dbInfo.RefreshToken, { foreignKey: "userId" });
dbInfo.RefreshToken.belongsTo(dbInfo.User, { foreignKey: "userId" });

dbInfo.Leave.belongsTo(dbInfo.Employee, { as: "employee", foreignKey: "employeeId" });
dbInfo.Leave.belongsTo(dbInfo.Employee, { as: "manager", foreignKey: "managerId" });

db.sync({ alter: true })
  .then(() => console.log("✅ All models synced"))
  .catch(err => console.error("❌ Sync failed:", err));
module.exports = dbInfo;