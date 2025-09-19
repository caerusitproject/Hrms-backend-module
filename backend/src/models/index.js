const db = require("../db"); // this is your pg client/connection

// Import models
const Employee = require("../models/Employee");
const Upload = require("../models/uploadModel");

// Export them so services/controllers can use like: db.Employee.find..., etc.
module.exports = {
  db,
  Employee,
  Upload,
};