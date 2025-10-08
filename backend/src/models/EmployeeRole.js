const { DataTypes } = require('sequelize');
const sequelize = require('../db');

module.exports = (sequelize, DataTypes) => {
  const EmployeeRole = sequelize.define('EmployeeRole', {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employee',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id'
      }
    }
  }, {
    tableName: 'employee_role'
  });

  return EmployeeRole;
};