
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
  try {
    const role = await adminService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await adminService.getAllRoles();
    res.json(roles);
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



exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await adminService.approveLeave(id, req.user.id);
    res.json({ message: "Leave approved", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const leave = await adminService.rejectLeave(id, req.user.id, reason);
    res.json({ message: "Leave rejected", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
