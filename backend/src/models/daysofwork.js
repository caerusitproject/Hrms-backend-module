
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
 const DaysWorking = sequelize.define("days_working", {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        day: {
            type: sequelize.STRING,
            allowNull: false
        },
        startingHour: {
            type: sequelize.STRING,
            allowNull: false
        }, 
        endingHour: {
            type: sequelize.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        underscored: true,
        freezeTableName: true,
    });