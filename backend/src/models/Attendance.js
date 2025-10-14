const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  empCode: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkIn: { type: DataTypes.TIME },
  checkOut: { type: DataTypes.TIME },
  timeSpent: { type: DataTypes.TIME},
  status: { type: DataTypes.STRING, defaultValue: 'Present' }
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [{ fields: ['empCode', 'date'] }]
});

//Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });


module.exports = Attendance;
