

const db = require("../db"); // this is your pg client/connection
const dbInfo = {}

dbInfo.Sequelize = db.Sequelize
dbInfo.Sequelize = db.Sequelize


// Import models
dbInfo.Employee = require("./Employee");
dbInfo.EmpFinancialInfo = require('./empFinanceInfo');
dbInfo.Upload = require("./uploadModel");
dbInfo.Attendance = require("./Attendance");
dbInfo.Role = require("./Role");
dbInfo.User = require("./User");
dbInfo.leaveRequest = require("./LeaveRequest");
dbInfo.Department = require("./department");
dbInfo.Upload = require("./uploadModel");
dbInfo.RefreshToken = require("./RefreshToken");




dbInfo.Employee.belongsTo(dbInfo.Department, { primaryKey: "departmentId", as: "dept" });
dbInfo.Department.hasMany(dbInfo.Employee, { foreignKey: "departmentId", as: "employee" },{onDelete: 'CASCADE', hooks: true})
dbInfo.Employee.belongsTo(dbInfo.Upload, { foreignKey: "id", as: "image" });
dbInfo.Upload.belongsTo(dbInfo.Employee,{foreignKey: "employee_id", as: "employee"},{onDelete: 'CASCADE', hooks: true});

dbInfo.User.belongsTo(dbInfo.Role, { foreignKey: "roleId", as: "role" });
dbInfo.Role.hasMany(dbInfo.User, { foreignKey: "roleId", as: "users" });

dbInfo.User.hasMany(dbInfo.RefreshToken, { foreignKey: "userId" });
dbInfo.RefreshToken.belongsTo(dbInfo.User, { foreignKey: "userId" });

/*sequelize.sync({ alter: true })
  .then(() => console.log("✅ All models synced"))
  .catch(err => console.error("❌ Sync failed:", err));*/
module.exports = dbInfo;