/*const { DataTypes } = require('sequelize');
const sequelize = require('../../db');


const Payslip = sequelize.define('Payslip', {
id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true  },
period: { type: DataTypes.STRING }, // 'YYYY-MM'
gross: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
totalDeductions: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
net: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
lineItemId: { type: DataTypes.INTEGER, allowNull: false },
pdfPath: { type: DataTypes.TEXT, allowNull: false },
sha256Hash: { type: DataTypes.CHAR(64), allowNull: false },
},{
  tableName: 'payslip',
  timestamps: true
});

module.exports = Payslip*/