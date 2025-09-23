const { DataTypes } = require('sequelize');
const sequelize = require('../db');

 const Department = sequelize.define("department", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        departmentName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        timestamps: false,
        underscored: true,
        freezeTableName: true
    });