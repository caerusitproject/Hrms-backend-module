const Department = require("../models/department");

class DepartmentService {
  async getAll() {
    logger.info("Fetching all departments");
    const depAll = await Department.findAll();
    if (depAll.length === 0) { return { message: 'No departments exists', data: [] }; }
    return depAll;
  }

  async getById(id) {
    logger.info(`Fetching department with ID ${id}`);
    return await Department.findByPk(id);
  }

  async create(data) {
    logger.info("Creating a new department");
    if (!data.departmentName || data.departmentName.trim() === '' || !data.description || data.description.trim() === '') {
      throw new Error('Department name or description not filled please enter valid data');
    }
    logger.info(`Creating department with name: ${data.departmentName}`);
    return await Department.create(data);
  }

  async update(id, data) {
    logger.info(`Updating department with ID ${id}`);
    if (
      (!data.departmentName || data.departmentName.trim() === '') &&
      (!data.description || data.description.trim() === '')
    ) {
      logger.error('Department name or description not filled atleast one value should be present please enter valid data');
      throw new Error('Department name or description not filled atleast one value should be present please enter valid data');
    }
    const dept = await Department.findByPk(id);
    if (!dept) {
      logger.error(`Department with ID ${id} not found`);
      throw new Error('Department not found');
    }
    await dept.update(data);
    return dept;
  }

  async delete(id) {
    logger.info(`Deleting department with ID ${id}`);
    const dept = await Department.findByPk(id);
    if (!dept) {
      logger.error(`Department with ID ${id} not found`);
      return false;
    }
    await dept.destroy();
    logger.info(`Department with ID ${id} deleted successfully.`);
    return true;
  }
}

module.exports = new DepartmentService();