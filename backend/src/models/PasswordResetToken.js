const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const PasswordResetToken = sequelize.define("PasswordResetToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "password_reset_tokens", // optional but recommended for clarity
  timestamps: false, // disable createdAt/updatedAt unless you want them
});

module.exports = PasswordResetToken;
