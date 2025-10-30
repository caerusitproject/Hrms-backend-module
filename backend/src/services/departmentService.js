const Department = require("../models/department");

class DepartmentService {
  async getAll() {
    const depAll = await Department.findAll();
    if (!depAll) { throw new Error('Error while retrieving the departments'); }
    if (depAll.length === 0) { return { message: 'No departments exists', data: [] }; }
    return depAll;
  }

  async getById(id) {
    return await Department.findByPk(id);
  }

  async create(data) {
    if (!data.departmentName || data.departmentName.trim() === '' || !data.description || data.description.trim() === '') {
      throw new Error('Department name or description not filled please enter valid data');
    }
    return await Department.create(data);
  }

  async update(id, data) {
    if (
      (!data.departmentName || data.departmentName.trim() === '') &&
      (!data.description || data.description.trim() === '')
    ) {
      throw new Error('Department name or description not filled atleast one value should be present please enter valid data');
    }
    const dept = await Department.findByPk(id);
    if (!dept) throw new Error('Department not found');
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