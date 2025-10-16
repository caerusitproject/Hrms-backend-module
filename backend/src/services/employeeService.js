const db = require("../models");
const Employee = db.Employee;
const bcrypt = require("bcryptjs");
const EmployeeRole = db.EmployeeRole;
const Department = db.Department;
const Role = db.Role;
const { Sequelize } = require("sequelize");;
const { sendNotificationEvent } = require('../services/notification/notificationProducer')
const { startConsumerScheduler } = require('./notification/notificationConsumer')

class EmployeeService {

  constructor() {
    this.initKafka();
  }

  //mail-send process
  async initKafka() {
    try {
      //await connectProducer();
      //console.log('✅ Kafka Producer connected');

      // Start consumer scheduler (runs every 1 hour)
      await startConsumerScheduler();
      console.log('🕐 Kafka Consumer Scheduler started');
    } catch (err) {
      console.error('❌ Kafka init failed:', err);
    }
  }
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
    // const hashedPassword = await bcrypt.hash(payload.password, 10);
    // payload.password = hashedPassword;
     if (payload.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;
  }

     const roleIds = payload.roleIds;
     const employee = await Employee.create(payload);
      if (roleIds) {
        await EmployeeRole.create({ employeeId: employee.id, roleId: roleIds });
      }
    //// ✅ Send Kafka message for email notification
    const message = {
      type: 'EMPLOYEE_REGISTRATION',
      to: employee.email,
      subject: 'Welcome to HRMS!',
      template: 'employee_welcome',
      payload: {
        name: employee.name,
        department: employee.departmentId,
      },
    };

    await sendNotificationEvent(message);
    console.log('✅ Kafka event published for employee registration');
    
    await startConsumerScheduler();

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
    try {
      // Validate input
      if (!managerId) {
        throw new Error('Manager ID is required');
      }

      // Fetch manager with subordinates
      const manager = await Employee.findOne({
        where: { id: managerId },
        include: [
          {
            model: Employee,
            as: 'subordinates',
            attributes: ['id', 'name', 'email'],
          },
        ],
        attributes: ['id', 'name', 'email'],
      });

      if (!manager) {
        throw new Error('Manager not found');
      }

      return manager;
    } catch (error) {
      console.error('❌ Error fetching manager with employees:', error.message);
      throw error;
    }
  }

  static async assignManager(employeeId, managerId) {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new Error("Employee not found");

    const manager = await Employee.findByPk(managerId);
    if (!manager) throw new Error("Manager not found");

    employee.managerId = managerId;
    await employee.save();
        
    console.log("Kafka Event Published: MANAGER_ASSIGNED");

    return employee;


  }

  // 🔍 Get all employees who are Managers
  static async getAllManagers() {

    try {
      
      const managers = await Employee.findAll({
        include: [
          {
            model: Role,
            as: 'roles',
            where: { role: 'MANAGER' },
            through: { attributes: [] }, // hide join table
            attributes: ['role'],
          },
        ],
        where: {
          managerId: null,
        },
        attributes: ['id', 'name', 'email','managerId'],
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
          /* {
             model: Role,
             as: 'roles',
             where: { name: 'Manager' },
             through: { attributes: [] },
           },*/
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'departmentName'],
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
          attributes: ['id', 'name','role']
        }
      ]
      });
      //const roles = await Role.findOne({where: {Id: employeeId}});
      //employee.roles = roles;
      if (!employee) {
        return null;
      }

      return employee;
    } catch (error) {
      console.error('Error fetching employee details by ID:', error);
      throw error;
    }
  };


  static async getAllManagersWithEmployees() {
    try {
      // Fetch all employees who have at least one subordinate
      console.log("employee-manager-list");
      const managers = await Employee.findAll({
        include: [
          {
            model: Employee,
            as: "subordinates",
            attributes: ["id", "name", "email"],
            where: {
              managerId: { [Sequelize.Op.ne]: null } // Exclude those with no managerId
            },
            required: true // Only include employees who are managers
          }
        ],
        attributes: ["id", "name", "email"]
      });

      return managers;
    } catch (error) {
      console.error("❌ Error fetching managers with employees:", error);
      throw error;
    }
  };
}



module.exports = EmployeeService;