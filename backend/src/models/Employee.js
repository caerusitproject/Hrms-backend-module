const { DataTypes } = require('sequelize');
const sequelize = require('../db');

  const Employee = sequelize.define('Empolyee',{
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    empCode: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    department: { type: DataTypes.STRING },
    designation: { type: DataTypes.STRING },
    joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'OFFER_CREATED' }
  }, {
    tableName: 'employees',
    timestamps: true

  })



/*
const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  empCode: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  department: { type: DataTypes.STRING },
  designation: { type: DataTypes.STRING },
  joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'OFFER_CREATED' }
}, {
  tableName: 'employees',
  timestamps: true
});*/

module.exports = Employee;
