const db = require("../db");
const { Sequelize} = require("sequelize");

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
dbInfo.LeaveInfo = require("./LeaveInfo");
dbInfo.Upload = require("./uploadModel");
dbInfo.RefreshToken = require("./RefreshToken");
dbInfo.EmployeeRole = require("./EmployeeRole");
dbInfo.Document=require("./Document")
//payroll
dbInfo.Compensation = require('./payroll/compensation');
dbInfo.Payroll = require('./payroll/payroll');
dbInfo.PayrollLineItem = require('./payroll/payrollLineItem');
dbInfo.Payslip = require('./payroll/payslip');
dbInfo.AiConversion = require('./AiConversation');
dbInfo.Broadcast = require('./Broadcast')

dbInfo.Employee.hasMany(dbInfo.Payroll, { foreignKey: 'employeeId' });
dbInfo.Payroll.belongsTo(dbInfo.Employee, { foreignKey: 'employeeId' });

dbInfo.Payroll.hasMany(dbInfo.PayrollLineItem, { foreignKey: 'payrollId' });
dbInfo.PayrollLineItem.belongsTo(dbInfo.Payroll, { foreignKey: 'payrollId' });

// 🧩 Initialize associations AFTER loading all models
//dbInfo.Department.hasMany(dbInfo.Employee, { foreignKey: "departmentId", as: "employees" });
dbInfo.Employee.belongsTo(dbInfo.Department, { foreignKey: "departmentId", as: "department" });

dbInfo.Employee.belongsTo(dbInfo.Upload, { foreignKey: "imageId", as: "image" });
dbInfo.Upload.belongsTo(dbInfo.Employee, { foreignKey: "employee_id", as: "employee" });

dbInfo.Employee.hasMany(dbInfo.Employee, { as: 'Subordinates', foreignKey: 'managerId' });
dbInfo.Employee.belongsTo(dbInfo.Employee, { as: 'Manager', foreignKey: 'managerId' });

// dbInfo.User.belongsTo(dbInfo.Role, { foreignKey: "roleId", as: "role" });
// dbInfo.Role.belongsTo(dbInfo.User, { foreignKey: "roleId", as: "users" });

dbInfo.User.belongsTo(dbInfo.Role, { foreignKey: "roleId", as: "role" });
dbInfo.Role.hasMany(dbInfo.User, { foreignKey: "roleId", as: "users" });


dbInfo.User.hasMany(dbInfo.RefreshToken, { foreignKey: "userId", as: "tokens" });
dbInfo.Employee.hasMany(dbInfo.RefreshToken, { foreignKey: "empId", as: "tokens" });
dbInfo.RefreshToken.belongsTo(dbInfo.Employee, { foreignKey: "empId", as: "employee" });
dbInfo.RefreshToken.belongsTo(dbInfo.User, { foreignKey: "userId", as: "user" });
dbInfo.Leave.belongsTo(dbInfo.Employee, { as: "employee", foreignKey: "employeeId" });
dbInfo.Leave.belongsTo(dbInfo.Employee, { as: "manager", foreignKey: "managerId" });
dbInfo.LeaveInfo.belongsTo(dbInfo.Employee, { as: "employee", foreignKey: "employeeId" });

// Associations

dbInfo.Employee.hasMany(dbInfo.Payroll, { foreignKey: 'employeeId' });
dbInfo.Payroll.belongsTo(dbInfo.Employee, { foreignKey: 'employeeId' });
dbInfo.Payroll.hasMany(dbInfo.PayrollLineItem, { foreignKey: 'payrollId' });
dbInfo.PayrollLineItem.belongsTo(dbInfo.Payroll, { foreignKey: 'payrollId' });
dbInfo.Employee.hasOne(dbInfo.Compensation, { foreignKey: 'employeeId' });
dbInfo.Compensation.belongsTo(dbInfo.Employee, { foreignKey: 'employeeId' });


dbInfo.Employee.hasOne(dbInfo.Compensation, { foreignKey: 'employeeId' });
dbInfo.Compensation.belongsTo(dbInfo.Employee, { foreignKey: 'employeeId' });

//Document
dbInfo.Document.belongsTo(dbInfo.Employee, { foreignKey: "uploadedBy", as: "uploader" });
dbInfo.Employee.hasMany(dbInfo.Document, { foreignKey: "uploadedBy", as: "uploadedDocuments" });

dbInfo.AiConversion.belongsTo(dbInfo.Employee, { foreignKey: "empId", as: "employee" });






// Many-to-Many with Role
    dbInfo.Employee.belongsToMany(dbInfo.Role, {
      through: dbInfo.EmployeeRole,
      foreignKey: 'employeeId',
      otherKey: 'roleId',
      as: 'roles',
    });
  



// ✅ Pass sequelize reference into models (for class-based models)
Object.values(dbInfo).forEach(model => {
  if (model && model.init && !model.sequelize) {
    model.sequelize = sequelize;
  }
});

// ✅ Sync models
if (process.env.NODE_ENV !== "test") {
  sequelize
    .sync({ alter: false })
    .then(() => console.log("✅ All models synced successfully"))
    .catch((err) => console.error("❌ Model sync failed:", err));
}
db.Sequelize = Sequelize;
db.sequelize = sequelize;

dbInfo.sequelize = sequelize;
module.exports = dbInfo;