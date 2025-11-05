
const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const Employee = require('./Employee.js');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
  tableName: 'Documents', // ensures table name consistency
});

// Uncomment and adjust association if needed
// Document.belongsTo(Employee, {
//   foreignKey: 'uploadedBy',
//   as: 'employee', // alias for cleaner includes
// });

module.exports = Document;
