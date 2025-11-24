/*const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Payroll = require('./payroll');


const PayrollLineItem = sequelize.define('PayrollLineItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  payrollId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING },
  type: { type: DataTypes.ENUM('EARNING', 'DEDUCTION'), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'payrollLineIitems', timestamps: true });

//Payroll.hasMany(PayrollLineItem, { foreignKey: 'payrollId' });
//PayrollLineItem.belongsTo(Payroll, { foreignKey: 'payrollId' });

module.exports = PayrollLineItem;*/