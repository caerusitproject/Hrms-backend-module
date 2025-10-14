const db = require("../db");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = db.sequelize || db;

const dbInfo = {};

// Import class-based models (no function calls)
dbInfo.Employee = require("./Employee");
dbInfo.Department = require("./department");
dbInfo.EmpFinancialInfo = require("./empFinanceInfo");
dbInfo.Attendance = require("./Attendance");
dbInfo.Role = require("./Role");
dbInfo.User = require("./User");
dbInfo.Leave = require("./LeaveRequest");
dbInfo.Upload = require("./uploadModel");
dbInfo.RefreshToken = require("./RefreshToken");
dbInfo.EmployeeRole = require("./EmployeeRole");

// 🧩 Initialize associations AFTER loading all models
dbInfo.Department.hasMany(dbInfo.Employee, { foreignKey: "departmentId", as: "employees" });
dbInfo.Employee.belongsTo(dbInfo.Department, { foreignKey: "departmentId", as: "department" });

dbInfo.Employee.belongsTo(dbInfo.Upload, { foreignKey: "imageId", as: "image" });
dbInfo.Upload.belongsTo(dbInfo.Employee, { foreignKey: "employee_id", as: "employee" });

dbInfo.Employee.hasMany(dbInfo.Employee, { as: 'Subordinates', foreignKey: 'managerId' });
dbInfo.Employee.belongsTo(dbInfo.Employee, { as: 'Manager', foreignKey: 'managerId' });

dbInfo.User.belongsTo(dbInfo.Role, { foreignKey: "roleId", as: "role" });
dbInfo.Role.hasMany(dbInfo.User, { foreignKey: "roleId", as: "users" });

dbInfo.User.hasMany(dbInfo.RefreshToken, { foreignKey: "userId", as: "tokens" });
dbInfo.Employee.hasMany(dbInfo.RefreshToken, { foreignKey: "empId", as: "tokens" });
dbInfo.RefreshToken.belongsTo(dbInfo.Employee, { foreignKey: "empId", as: "employee" });
dbInfo.RefreshToken.belongsTo(dbInfo.User, { foreignKey: "userId", as: "user" });


dbInfo.Leave.belongsTo(dbInfo.Employee, { as: "employee", foreignKey: "eId" });
dbInfo.Leave.belongsTo(dbInfo.Employee, { as: "manager", foreignKey: "managerId" });





// ✅ Pass sequelize reference into models (for class-based models)
// Object.values(dbInfo).forEach(model => {
//   if (model && model.init && !model.sequelize) {
//     model.sequelize = sequelize;
//   }
// });

// ✅ Sync models
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ All models synced successfully"))
  .catch((err) => console.error("❌ Model sync failed:", err));

dbInfo.sequelize = sequelize;
dbInfo.Sequelize = Sequelize;

module.exports = dbInfo;