const roleServ = require("../services/roleService");

exports.addRole = async (req, res) => {
  try {
    
    const { name , role} = req.body;
    console.log("role name", req.body);
    if (!name) return res.status(400).json({ error: "Role name is required" });

    const roledata = await roleServ.createRole(name, role);
    res.status(201).json({ message: "Role created successfully", roledata });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listRoles = async (req, res) => {
  try {
    const roles = await roleServ.getRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};