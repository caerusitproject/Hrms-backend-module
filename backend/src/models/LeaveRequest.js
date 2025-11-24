const { DataTypes } = require("sequelize");
const sequelize = require('../db');

const Leave = sequelize.define("Leave", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type:{
    type: DataTypes.STRING,
    allowNull:false,
    defaultValue:"Casual Leave",
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING",
  },
  workflowId:{type: DataTypes.INTEGER},
},{
  tableName: "leave_requests",
  timestamps: true,
});



module.exports = Leave;