const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");
const User = require("./User"); // Make sure this path is correct

class Role extends Model {}

Role.init(
  {
    name: DataTypes.STRING,
  },
  { sequelize, modelName: "Role" }
);

Role.belongsToMany(User, { through: "UserRoles" });

module.exports = Role;