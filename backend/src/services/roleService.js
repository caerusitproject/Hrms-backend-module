const { Role } = require("../models");

const createRole = async (name) => {
  const role = await Role.create({ name });
  return role;
};

const getRoles = async () => {
  return await Role.findAll();
};

const getRoleNameById = async (roleId) => {
  try {
    const role = await Role.findByPk(roleId, {
      attributes: ["id", "name"],
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return role.name;
  } catch (error) {
    throw error;
  }
};

module.exports = { createRole, getRoles,getRoleNameById};