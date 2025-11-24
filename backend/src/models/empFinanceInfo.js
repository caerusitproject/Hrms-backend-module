const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const EmpFinancialInfo = sequelize.define("emp_financial_info", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      employmentType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      salaryBasic: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      salaryGross: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      salaryNet: {
          type: DataTypes.INTEGER,
          allowNull: true
      },
      allowanceHouseRent: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allowanceMedical: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allowanceSpecial: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allowanceFuel: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allowancePhoneBill: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allowanceOther: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      allowanceTotal: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deductionProvidentFund: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deductionTax: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deductionOther: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deductionTotal: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      iban: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
        timestamps: false,
        freezeTableName: true,
        underscored: true
    });

    module.exports = EmpFinancialInfo