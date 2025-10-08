const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WorkflowLog = sequelize.define('WorkflowLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: { type: DataTypes.BIGINT, allowNull: false },
  event: { type: DataTypes.STRING, allowNull: false },
  payload: { type: DataTypes.JSONB }
}, {
  tableName: 'workflow_logs',
  timestamps: true
});

module.exports = WorkflowLog;