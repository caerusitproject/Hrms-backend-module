const  Role  = require("../models/Role");

const createRole = async (name, role) => {
  const roledata = await Role.create({ name , role});
  return roledata;
};

const getRoles = async () => {
  const roles= await Role.findAll();
  if(!roles || roles.length===0){return {message: "No roles EXIST. ", roles:[]};}
  return roles;
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

module.exports = { createRole, getRoles, getRoleNameById};