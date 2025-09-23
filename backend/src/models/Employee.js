const { DataTypes } = require('sequelize');
const sequelize = require('../db');

  const Employee = sequelize.define('Empolyees',{
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    empCode: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    department: { type: DataTypes.STRING },
    dateOfBirth: {type: DataTypes.DATEONLY, allowNull: true },
    joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
    gender: {type: DataTypes.STRING, allowNull: false },
    maritalStatus: {type: DataTypes.STRING, allowNull: true },
    fatherName: {type: DataTypes.STRING, allowNull: true },
    idNumber: {type: DataTypes.STRING, allowNull: true },
    address: {type: DataTypes.STRING, allowNull: true },
    city: {type: DataTypes.STRING, allowNull: true },
    country: {type: DataTypes.STRING, allowNull: true },
    mobile: {type: DataTypes.STRING, allowNull: true },
    phone: {type: DataTypes.STRING, allowNull: true },
    //imageUrl:{type: DataTypes.STRING, allowNull: true},
      
    state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'OFFER_CREATED' }
  }, {
    tableName: 'employee',
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
