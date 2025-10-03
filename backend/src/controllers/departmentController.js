const departmentService = require("../services/departmentService");

class DepartmentController {
  async getAll(req, res) {
    const departments = await departmentService.getAll();
    res.json(departments);
  }

  async getById(req, res) {
    const department = await departmentService.getById(req.params.id);
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  }

  async create(req, res) {
    const department = await departmentService.create(req.body);
    res.status(201).json(department);
  }

  async update(req, res) {
    const department = await departmentService.update(req.params.id, req.body);
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  }

  async delete(req, res) {
    const deleted = await departmentService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Department not found" });
    res.status(204).send();
  }
}

module.exports = new DepartmentController();