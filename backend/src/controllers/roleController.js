const { createRole, getRoles } = require("../services/roleService");

exports.addRole = async (req, res) => {
  try {
    
    const { name } = req.body;
    console.log("role name", req.body);
    if (!name) return res.status(400).json({ error: "Role name is required" });

    const role = await createRole(name);
    res.json({ message: "Role created successfully", role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listRoles = async (req, res) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};