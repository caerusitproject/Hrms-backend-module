const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Employee = require('./Employee');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.BIGINT, allowNull: false },
  leaveType: { type: DataTypes.STRING, allowNull: false },
  fromDate: { type: DataTypes.DATEONLY, allowNull: false },
  toDate: { type: DataTypes.DATEONLY, allowNull: false },
  days: { type: DataTypes.DECIMAL(5,2), allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  reason: { type: DataTypes.TEXT }
}, {
  tableName: 'leave_requests',
  timestamps: true
});

LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId' });


module.exports = LeaveRequest;
