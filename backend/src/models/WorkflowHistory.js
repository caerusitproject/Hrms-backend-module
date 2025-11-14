const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const workflowHistory = sequelize.define('workflow_history', {
   id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
    workflowId: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: true },
    actorId: {type: DataTypes.INTEGER, allowNull: true},
    remarks: {type: DataTypes.STRING, allowNull: true},
    comment: { type: DataTypes.JSONB, allowNull: true }
    
  }, { tableName: 'workflow_history', timestamps: true });



module.exports = workflowHistory