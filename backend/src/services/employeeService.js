const db = require("../models");
const Employee = db.Employee;

class EmployeeService {
/**
   * Create a new employee
   * @param {Object} payload - employee details
   * @returns {Promise<Object>}
   */
  static async createEmployee(payload) {
    // if no joining_date provided, set to today
    if (!payload.joining_date) {
      payload.joining_date = new Date();
    }

    const employee = await Employee.create(payload);
    return employee;
  }

  /**
   * Get all employees
   * @returns {Promise<Array>}
   */
  static async getAllEmployees() {
    return await Employee.findAll({
      order: [["id", "ASC"]],
    });
  }

  /**
   * Get employee by ID
   * @param {Number} id
   * @returns {Promise<Object|null>}
   */
  static async getEmployeeById(id) {
    return await Employee.findByPk(id);
  }

  /**
   * Update employee details
   * @param {Number} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateEmployee(id, updates) {
    const employee = await Employee.findByPk(id);
    if (!employee) return null;

    await employee.update(updates);
    return employee;
  }

  /**
   * Delete an employee
   * @param {Number} id
   * @returns {Promise<Boolean>}
   */
  static async deleteEmployee(id) {
    const deleted = await Employee.destroy({ where: { id } });
    return deleted > 0;
  }

}

module.exports = EmployeeService;