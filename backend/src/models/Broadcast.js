const { DataTypes } = require("sequelize");
const sequelize = require('../db');
const Broadcast = sequelize.define('Broadcast', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: {type: DataTypes.STRING},
  content:{type: DataTypes.TEXT}
});

module.exports = Broadcast;