const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: { // e.g. 'onboarding', 'forgot_password'
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: { // Handlebars or mustache syntax
    type: DataTypes.TEXT,
    allowNull: false
  },
  allowedVariables: { // JSON array of variable names
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  isHtml: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'EmailTemplates',
  timestamps: true
});

module.exports = EmailTemplate;
