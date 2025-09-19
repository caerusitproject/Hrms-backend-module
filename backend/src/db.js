/*const { Sequelize } = require('sequelize');
require('dotenv').config();

const connString = process.env.DATABASE_URL
console.log("database-string=",connString)
const sequelize = new Sequelize(connString, {
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;*/



const Sequelize = require("sequelize");
    const dbConfig = require("./db.config.js");

    const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
      host: dbConfig.HOST,
      dialect: dbConfig.dialect,
      pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
      }
    });

   
    

    module.exports = sequelize;