const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.BIGINT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkIn: { type: DataTypes.TIME },
  checkOut: { type: DataTypes.TIME },
  status: { type: DataTypes.STRING, defaultValue: 'Present' }
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [{ fields: ['employeeId', 'date'] }]
});

Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });


module.exports = Attendance;
