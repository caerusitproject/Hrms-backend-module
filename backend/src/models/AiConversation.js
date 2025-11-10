// src/models/AiConversation.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

  const AiConversation = sequelize.define("AiConversation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    empId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null for guest
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },{
  tableName: 'AiConversation',
  timestamps: true,
  
});
  

module.exports = AiConversation;
