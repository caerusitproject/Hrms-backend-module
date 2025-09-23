const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");
const Role = require("./Role"); // Make sure this path is correct

/*class User extends Model {}

User.init(
  {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  { sequelize, modelName: "User" }
);*/

const User = sequelize.define("user", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        },
        unique: {
          args: 'username',
          msg: 'This username is already taken!'
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM,
        values: ['ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE','HR_ROLE'],
        allowNull: false
      },
      active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          validate: {
            notEmpty: true
          }
      }
    }, {
        timestamps: false,
        underscored: true,
        freezeTableName: true
    });

//User.belongsToMany(Role, {through: "UserRoles"})


module.exports = User;