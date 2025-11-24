const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SalaryStructure = sequelize.define('SalaryStructure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empCode: { type: DataTypes.STRING, allowNull: true },
  effectiveFrom: { type: DataTypes.DATEONLY },
  effectiveTo: { type: DataTypes.DATEONLY },
  basic: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  hra: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  allowances: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  deductions: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }
}, {
  tableName: 'salary_structures',
  timestamps: true
});

module.exports = SalaryStructure;
