const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Payslip = sequelize.define('Payslip', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.BIGINT, allowNull: false },
  period: { type: DataTypes.STRING }, // 'YYYY-MM'
  gross: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  totalDeductions: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  net: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }
}, {
  tableName: 'payslips',
  timestamps: true,
  indexes: [{ unique: true, fields: ['employeeId', 'period'] }]
});

module.exports = Payslip;
