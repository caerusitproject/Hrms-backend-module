const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true, 
  tableName: 'Holidays', 
});
module.exports = Holiday;
