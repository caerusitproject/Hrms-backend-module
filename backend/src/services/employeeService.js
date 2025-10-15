const db = require("../models");
const Employee = db.Employee;
const bcrypt = require("bcryptjs");
const EmployeeRole = db.EmployeeRole;
const Department = db.Department;
const Role = db.Role;


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
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;

    const roleIds = payload.roleIds;
    //if(!payload.departmentId){
    //  return 
    //}

    const employee = await Employee.create(payload);

    if (roleIds) {

      await EmployeeRole.create({ employeeId: employee.id, roleId: roleIds });

    }

    return employee;
  }

  /**
   * Get all employees
   * @returns {Promise<Array>}
   */
  static async getAllEmployees() {
    const emp = await Employee.findAll();
    /*include: [
     {
         model: Department,
         as: "department",
         attributes: ["id", "name"],
       },
   ],
   order: [["id", "ASC"]],
 });*/
    return emp;
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


  static async uploadEmployeeImage(id, imagePath) {
    try {
      const employee = await Employee.findByPk(id);
      if (!employee) throw new Error("Employee not found");

      employee.imageUrl = imagePath;
      await employee.save();

      return employee;
    } catch (err) {
      throw err;
    }
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

  /*static async getAllEmployees() {
    return await Employee.findAll({
      include: [
        {
          model: Employee,
          as: "manager",
          attributes: ["id", "name", "lastName", "email"],
        },
      ],
    })
  }*/



  static async getSubordinates(managerId) {
    return await Employee.findAll({
      where: { managerId },
      include: [{ model: Employee, as: "manager", attributes: ["id", "firstName", "lastName"] }],
    });
  }

  static async assignManager(employeeId, managerId) {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new Error("Employee not found");

    const manager = await Employee.findByPk(managerId);
    if (!manager) throw new Error("Manager not found");

    employee.managerId = managerId;
    await employee.save();

    // --- Publish event to Kafka ---
    await producer.connect();
    await producer.send({
      topic: "employee-manager-assignment",
      messages: [
        {
          value: JSON.stringify({
            eventType: "MANAGER_ASSIGNED",
            manager: {
              id: manager.id,
              name: `${manager.firstName} ${manager.lastName}`,
              email: manager.email,
            },
            employee: {
              id: employee.id,
              name: `${employee.firstName} ${employee.lastName}`,
              email: employee.email,
            },
            timestamp: new Date(),
          }),
        },
      ],
    });

    console.log("Kafka Event Published: MANAGER_ASSIGNED");

    return employee;


  }

  // 🔍 Get all employees who are Managers
  static async getAllManagers() {

    try {
      // Find all distinct managerIds that appear in the employee table
      const managerIds = await Employee.findAll({
        attributes: ['managerId'],
        where: {
          managerId: { [Op.ne]: null } // Exclude nulls
        },
        group: ['managerId'],
        raw: true
      });

      const ids = managerIds.map(m => m.managerId);

      // Now find all employees whose id is in that manager list
      const managers = await Employee.findAll({
        where: { id: ids },
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'departmentName']
          },
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id', 'role']
          }
        ],
        attributes: ['id', 'name', 'email']
      });

      return managers;
    } catch (error) {
      console.error("Error fetching managers:", error);
      throw error;
    }
  }


  // 🧠 Get a specific manager by ID
  static async getManagerById(managerId) {
    try {
      const manager = await Employee.findOne({
        where: { id: managerId },
        include: [
          {
            model: Role,
            as: 'roles',
            where: { name: 'Manager' },
            through: { attributes: [] },
          },
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name'],
          }
        ],
      });

      if (!manager) {
        throw new Error(`Manager with ID ${managerId} not found`);
      }

      return manager;
    } catch (error) {
      console.error("Error fetching manager by ID:", error);
      throw error;
    }
  }



  static async getEmployeeDetailsById(employeeId) {
    try {
      const employee = await Employee.findOne({
        where: { id: employeeId },
        attributes: ['id', 'email'],
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] }, // hides join table
            attributes: ['id', 'name', 'role']
          }
        ]
      });

      if (!employee) {
        return null;
      }

      return employee;
    } catch (error) {
      console.error('Error fetching employee details by ID:', error);
      throw error;
    }
  };
}



module.exports = EmployeeService;