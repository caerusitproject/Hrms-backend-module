const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Handbook = sequelize.define("Handbooks", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contentUrl: {
    type: DataTypes.STRING,
    allowNull: false,  // stores the file URL
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: "Handbooks",
});

module.exports = Handbook;