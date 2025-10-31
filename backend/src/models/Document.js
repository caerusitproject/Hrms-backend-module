const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const User = require('./User.js');
const Employee=require('./Employee.js')
const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  type: DataTypes.ENUM('HANDBOOK', 'POLICY','CONTRACT'),
  uploadedBy: { type: DataTypes.INTEGER, references: { model: Employee, key: 'id' }, defaultValue: 4 }//now references to employee instead of usernow diocument belongs to employee nistaed of user table
});

Document.belongsTo(Employee, { foreignKey: 'uploadedBy' });

module.exports = Document;

/*const Document = sequelize.define("Document", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: { type: DataTypes.STRING,
          allowNull:false
         },
         type: DataTypes.ENUM('HANDBOOK', 'POLICY','CONTRACT'),
         uploadedBy: { type: DataTypes.INTEGER, references: { model: Employee, key: 'id' } }
    }, {
        tableName: "document",
        timestamps: false,
       
    });

    module.exports = Document;*/