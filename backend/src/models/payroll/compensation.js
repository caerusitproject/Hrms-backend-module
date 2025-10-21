const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Employee = require('../Employee');

const Compensation = sequelize.define('Compensation', {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    baseSalary: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    bonus: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    deductions: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    hra: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    da: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    pf: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    allowances: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },{
    tableName: 'Compensation',
    timestamps: true
  });

 Employee.hasOne(Compensation, { foreignKey: 'employeeId' });
 Compensation.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = Compensation;