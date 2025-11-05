
const adminService = require("../../services/admin/adminService");


exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await adminService.getAllEmployees();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRole = async (req, res) => {
    const {name, role} = req.body;
    if(!name || !role) {return res.status(400).json({error:400, message:"name or role missing" });}
  try {
    if(name && role) {
      const Role = await adminService.createRole(name,role);
      return res.status(201).json(Role);

    }else{
      return res.status(400).json({error:400, message:"name or role missing" });
    }
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await adminService.getAllRoles();
   return res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await adminService.deleteRole(req.params.id);
    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignRoles = async (req, res) => {
  try {
    const { employeeId, roleIds } = req.body;
    const emp = await adminService.assignRoles(employeeId, roleIds);
    res.json({ message: "Roles updated", emp });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.createDepartment = async (req, res) => {
  try {
    const dept = await adminService.createDepartment(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// config Mail, config template , create Payroll information details, 
