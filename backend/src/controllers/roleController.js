const roleServ = require("../services/roleService");

exports.addRole = async (req, res) => {
  try {
    
    const { name , role} = req.body;
    console.log("role name", req.body);
    if (!name) return res.status(400).json({ error: "Role name is required" });

    const roledata = await createRole(name, role);
    return res.status(200).json({ message: "Role created successfully", roledata });
  } catch (err) {
    return res.status(400).json({ error:400, message: err.message });
  }
};

exports.listRoles = async (req, res) => {
  try {
    const roles = await getRoles();
    return res.status(200).json(roles);
  } catch (err) {
    return res.status(500).json({ error: 500, message: err.message });
  }
};