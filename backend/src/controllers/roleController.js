const { Exception } = require("handlebars");
const roleServ = require("../services/roleService");

exports.addRole = async (req, res) => {
  try {
    
    const { name , role} = req.body;
    console.log("role name", req.body);
    if (!name) return res.status(400).json({ error: "Role name is required" });

    const roledata = await createRole(name, role);
    return res.status(201).json({ message: "Role created successfully", roledata });
  } catch (err) {
    return res.status(400).json({ error:400, message: err.message });
  }
};

exports.listRoles = async (req, res) => {
  try {
    const roles = await roleServ.getRoles();
    if(!roles) return res.status(400).json({ error: "Role not found" });
    return res.status(200).json(roles);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};