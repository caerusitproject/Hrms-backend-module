const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Employee = sequelize.define('employee', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  empCode: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  designation: { type: DataTypes.STRING },
  employmentType: { type: DataTypes.STRING, defaultValue: "Full-time" },
  status: { type: DataTypes.STRING, defaultValue: "Active" },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: false },
  maritalStatus: { type: DataTypes.STRING, allowNull: true },
  fatherName: { type: DataTypes.STRING, allowNull: true },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  idNumber: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  mobile: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  // FK field
  departmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'department', key: 'id', }, },

  state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'OFFER_CREATED' },

}, {
  tableName: 'employee',
  timestamps: true

});


Employee.belongsTo(Employee, {
    as: 'manager',
    foreignKey: 'managerId'
  });

  Employee.hasMany(Employee, {
    as: 'subordinates',
    foreignKey: 'managerId'
  });

  

module.exports = Employee;