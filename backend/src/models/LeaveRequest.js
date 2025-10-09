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
});



module.exports = Leave;

/*const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');
const Employee = require('./Employee.js');

const Leave = sequelize.define('Leave', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER, references: { model: Employee, key: 'id' } },
  status: DataTypes.ENUM('pending', 'accepted', 'rejected'),
  dates: DataTypes.JSON
});

module.exports = Leave;*/