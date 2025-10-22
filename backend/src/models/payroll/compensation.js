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
    incentives: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    overtimePay: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    commission: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    allowances: {
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
    lta: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    medicalAllowance: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    pf: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    esi: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    gratuity: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    professionalTax: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    incomeTax: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    deductions: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalEarnings: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalDeductions: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    netSalary: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },{
    tableName: 'Compensation',
    timestamps: true
  });

  Compensation.associate = (models) => {
  Compensation.belongsTo(models.Employee, { foreignKey: 'employeeId' });
  };

  Compensation.beforeSave((comp) => {
    const totalEarnings =
      comp.baseSalary +
      comp.bonus +
      comp.incentives +
      comp.overtimePay +
      comp.commission +
      comp.allowances +
      comp.hra +
      comp.da +
      comp.lta +
      comp.medicalAllowance;

    const totalDeductions =
      comp.pf +
      comp.esi +
      comp.gratuity +
      comp.professionalTax +
      comp.incomeTax +
      comp.deductions;

    comp.totalEarnings = totalEarnings;
    comp.totalDeductions = totalDeductions;
    comp.netSalary = totalEarnings - totalDeductions;
  });

 Employee.hasOne(Compensation, { foreignKey: 'employeeId' });
 Compensation.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = Compensation;