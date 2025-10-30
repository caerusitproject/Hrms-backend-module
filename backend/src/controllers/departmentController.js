const departmentService = require("../services/departmentService");

class DepartmentController {
  async getAll(req, res) {
    try {
      const departments = await departmentService.getAll();
      res.json(departments);
    } catch (error) {
       return res.status(404).json({ error: 404, message: error.message });
    }
    res.status(500).json({ error: 500, message: 'Internal Server Error' });
  }

  async getById(req, res) {
    const department = await departmentService.getById(req.params.id);
    if (!department) return res.status(404).json({ error: 404, message: "Department not found" });
    res.json(department);
  }

  async create(req, res) {
    try {
      const department = await departmentService.create(req.body);
      res.status(201).json(department);
    }catch (error) {
      return res.status(400).json({ error: 400, message: error.message });
    }
     res.status(500).json({ error: 500, message: 'Internal Server Error' });
  }

  async update(req, res) {
    try{
      const department = await departmentService.update(req.params.id, req.body);
      res.json(department);
    }catch (error) {
      if (error.message === 'Department not found' || error.message ==='Department name or description not filled atleast one value should be present please enter valid data') {
        return  res.status(404).json({ error: 404, message: error.message });
      }
      res.status(500).json({ error: 500, message: 'Internal server Error' });
    }
  }

  async delete(req, res) {
    const deleted = await departmentService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error:404, message: "Department not found" });
    res.status(204).send();
  }
}

module.exports = new DepartmentController();