const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Employee = require('../Employee');

const Payroll = sequelize.define('Payroll', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.STRING, allowNull: false },
  grossSalary:{ type : DataTypes.FLOAT, defaultValue: 0},
  deductions: { type: DataTypes.FLOAT, defaultValue: 0 },
  netSalary: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Generated' }, // Generated, Paid
}, { tableName: 'payrolls' , timestamps: true});


module.exports = Payroll;