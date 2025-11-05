const departmentService = require("../services/departmentService");

class DepartmentController {
  async getAll(req, res) {
    try {
      const departments = await departmentService.getAll();
      return res.json(departments);
    } catch (error) {
       return res.status(404).json({ error: 404, message: error.message });
    }
  }

  async getById(req, res) {
    const department = await departmentService.getById(req.params.id);
    if (!department) return res.status(404).json({ error: 404, message: "Department not found" });
    return res.status(200).json(department);
  }

  async create(req, res) {
    try {
      const department = await departmentService.create(req.body);
      return res.status(201).json(department);
    }catch (error) {
      return res.status(400).json({ error: 400, message: error.message });
    }
  }

  async update(req, res) {
    try{
      const department = await departmentService.update(req.params.id, req.body);
      return res.status(200).json(department);
    }catch (error) {
      if (error.message === 'Department not found' || error.message ==='Department name or description not filled atleast one value should be present please enter valid data') {
        return  res.status(404).json({ error: 404, message: error.message });
      }
      return res.status(500).json({ error: 500, message: 'Internal server Error' });
    }
  }

  async delete(req, res) {
  try {
    const deleted = await departmentService.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 404, message: "Department not found" });
    }

    // Success case
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 500, message: "An error occurred while deleting the department" });
  }
}

}

module.exports = new DepartmentController();