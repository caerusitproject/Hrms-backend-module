const { DataTypes } = require("sequelize");
const sequelize = require('../db');

const LeaveInfo = sequelize.define("LeaveInfo", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    earnedLeave: {
        type: DataTypes.INTEGER,
        defaultValue: 12
    },
    casualLeave: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sickLeave: {
        type: DataTypes.INTEGER,
        defaultValue: 20
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    }
},{
  tableName: 'leaveinfo',
  timestamps: true

});



module.exports = LeaveInfo;