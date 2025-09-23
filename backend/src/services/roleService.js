const { Role } = require("../models");

const createRole = async (name) => {
  const role = await Role.create({ name });
  return role;
};

const getRoles = async () => {
  return await Role.findAll();
};

module.exports = { createRole, getRoles };