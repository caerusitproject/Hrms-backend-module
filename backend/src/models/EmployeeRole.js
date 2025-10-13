const { DataTypes } = require('sequelize');
const sequelize = require('../db');


  const EmployeeRole = sequelize.define("EmployeeRole", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  module.exports = EmployeeRole;
