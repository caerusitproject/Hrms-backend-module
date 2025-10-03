const { DataTypes } = require('sequelize');
const sequelize = require('../db');

 const Department = sequelize.define("Department", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        departmentName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        tableName: "department",
        timestamps: false,
        underscored: true,
        freezeTableName: true
    });

  module.exports = Department;