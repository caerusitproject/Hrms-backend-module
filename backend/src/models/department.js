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
        },
        description: { type: DataTypes.STRING },
    }, {
        tableName: "department",
        timestamps: false,
       
    });

  module.exports = Department;