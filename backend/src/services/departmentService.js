const Department = require("../models/department");

class DepartmentService {
  async getAll() {
    return await Department.findAll();
  }

  async getById(id) {
    return await Department.findByPk(id);
  }

  async create(data) {
    return await Department.create(data);
  }

  async update(id, data) {
    const dept = await Department.findByPk(id);
    if (!dept) return null;
    await dept.update(data);
    return dept;
  }

  async delete(id) {
    const dept = await Department.findByPk(id);
    if (!dept) return false;
    await dept.destroy();
    return true;
  }
}

module.exports = new DepartmentService();