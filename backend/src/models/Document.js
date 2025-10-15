const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const User = require('./User.js');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  type: DataTypes.ENUM('HANDBOOK', 'POLICY','CONTRACT'),
  uploadedBy: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } }
});

Document.belongsTo(User, { foreignKey: 'uploadedBy' });

module.exports = Document;