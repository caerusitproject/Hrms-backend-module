const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WorkflowLog = sequelize.define('WorkflowLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  processType: { type: DataTypes.STRING, allowNull: true },
  employeeId: { type: DataTypes.BIGINT, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: true },
  initiatedBy: { type: DataTypes.INTEGER, allowNull: true },
  event: { type: DataTypes.STRING, allowNull: true },
  payload: { type: DataTypes.JSONB }
}, {
  tableName: 'workflow_logs',
  timestamps: true
});

module.exports = WorkflowLog;