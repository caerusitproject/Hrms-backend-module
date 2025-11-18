const db = require("../models");
const Employee = db.Employee;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmployeeRole = db.EmployeeRole;
const Department = db.Department;
const Role = db.Role;
const { Sequelize } = require("sequelize");;
const { sendEmailNotification } = require('../services/notification/notificationHandler');
const { where } = require("sequelize");
const {completeOnboarding, verifyDocs, startOnboarding} = require("./workflow/onboardingWorkflow");

class EmployeeService {

  /**
    * Create a new employee
    * @param {Object} payload - employee details
    * @returns {Promise<Object>}
    */
  static async createEmployee(payload,id) {

    if (!payload.joining_date) {
      payload.joining_date = new Date();
    }
    try {
      if (payload.password) {
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        payload.password = hashedPassword;
      }
    } catch (err) {
      throw new Error("Error hashing password: " + err.message);
    }

    if(!payload.managerId)payload.managerId=1;
    const roleIds = payload.roleIds;
    const employee = await Employee.create(payload);
    if (roleIds) {
      await EmployeeRole.create({ employeeId: employee.id, roleId: roleIds });
    }

    try {

      const message = {
        type: 'EMPLOYEE_REGISTRATION',
        email: employee.email,
        subject: 'Welcome to HRMS!',
        template: 'employee_welcome',
        payload: {
          name: employee.name,
          department: employee.departmentId,
          email: employee.email,
          type: "employee_registration",
          empCode: employee.empCode
        },
      };
      await sendEmailNotification(message);
      payload.processType = 'ONBOARDING';
      payload.employeeId = employee.id;
      payload.initiatorId = id;
      const ob= await  startOnboarding(payload);









    } catch (error) {
      console.error("Error sending email notification:", error);
    }

    //await sendNotificationEvent(message);
    //console.log('✅ Kafka event published for employee registration');

    //await startConsumerScheduler();

    return employee;
  }

  /**
   * Get all employees
   * @returns {Promise<Array>}
   */

  static async getAllEmployeesPag(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const total = await Employee.count({ where: { status: 'Active' } });

    if (total === 0) {
      return {
        message: "No active employees found",
        employees: [],
        pagination: null
      };
    }


    const employees = await Employee.findAll({
      where: { status: 'Active' },
      attributes: ['id', 'name', 'email', 'designation', 'status'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'departmentName'],
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'role'],
          through: { attributes: [] },
        },
      ],
      order: [['id', 'ASC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      employees,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        recordsPerPage: limit,
        hasNextPage: hasNext,
        hasPrevPage: hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    };
  }

  static async getAllEmployees() {
  const total = await Employee.count({ where: { status: 'Active' } });

  if (total === 0) {
    return {
      message: "No active employees found",
      employees: []
    };
  }

  const employees = await Employee.findAll({
    where: { status: 'Active' },
    attributes: ['id', 'name', 'email', 'designation', 'status'],
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'departmentName'],
      },
      {
        model: Role,
        as: 'roles',
        attributes: ['id', 'role'],
        through: { attributes: [] },
      },
    ],
    order: [['id', 'ASC']],
  });

  return {
    employees
  };
}


  /**
   * Get employee by ID
   * @param {Number} id
   * @returns {Promise<Object|null>}
   */
  static async getEmployeeById(id) {
    const empData = await Employee.findOne({
      where: { id: id },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "departmentName"],
        },
        {
          model: Employee,
          as: "Manager",
          attributes: ["id", "name"],
        },
        {
          model: Role,
          as: "roles", // 👈 use the belongsToMany alias
          attributes: ["id", "name", "role"],
          through: { attributes: [] }, // hide join table columns
        },
      ],
    });
    if (!empData) throw new Error("Employee not found");
    return empData;
  }

  /**
   * Update employee details
   * @param {Number} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */


  static async updateEmployee(id, updates) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error("Employee not found");
    await employee.update(updates);
    return employee;
  }

  static async removeEmployee(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error("Employee not found");
    employee.status = 'Inactive';
    await employee.save();
    return true;
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
    
    return employee;
  }

  // 🔍 Get all employees who are Managers
 static async getAllManagers() {
  try {
    // First get distinct managerIds (excluding null)
    const managerIdsData = await Employee.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('managerId')), 'managerId']],
      where: {
        managerId: { [Sequelize.Op.ne]: null }
      },
      raw: true,
    });

    const managerIds = managerIdsData.map(item => item.managerId);

    // Fetch employees whose IDs are in the managerIds array, and who have the role "MANAGER"
    const managers = await Employee.findAll({
      where: {
        id: managerIds
      },
      include: [
        {
          model: Role,
          as: 'roles',
          where: { role: 'MANAGER' },
          through: { attributes: [] }, // hide join table
          attributes: ['role'],
        },
      ],
      attributes: ['id', 'name', 'email', 'managerId'],
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
    if (!employeeId) {
      throw new Error("No employee ID provided. Please provide a valid employee ID");
    }
    try {
      const employee = await Employee.findOne({
        where: { id: employeeId },
        attributes: ['id', 'empCode', 'email', 'name', 'designation', 'status', 'departmentId'],
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['departmentName']
          }
        ]
      });
      if (!employee) {
        throw new Error("NO employee record found for the coreesponding Employee ID.");
      }
      return employee;
    } catch (error) {
      console.error('Error fetching employee details by ID:', error);
      throw error;
    }
  };


  static async getAllManagersWithEmployees() {
    try {
      console.log("employee-manager-list");
      const managers = await Employee.findAll({
        include: [
          {
            model: Employee,
            as: "subordinates",
            attributes: ["id", "name", "email"],
            where: {
              managerId: { [Sequelize.Op.ne]: null }
            },
            required: true
          }
        ],
        attributes: ["id", "name", "email"]
      });
      if (!managers || managers.length === 0) {
        return { message: "Employee list is empty" };
      }
      return managers;
    } catch (error) {
      console.error("❌ Error fetching managers with employees:", error);
      throw error;
    }
  }

  static async getAllRoleWiseEmployees(employeeId, roles) {
    try {
      let employeeList = [];
      let totalEmployees = 0;

      if (roles.includes('ADMIN') || roles.includes('HR')) {
        // Admins and HR can see all employees
        const employees = await Employee.findAndCountAll({
          where: { status: 'Active' },
          attributes: [
            'id',
            'empCode',
            'email',
            'name',
            'status',
            'idNumber',
            'managerId',
            'imageId',
            'designation'
          ]
        });

        totalEmployees = employees.count;
        employeeList = employees.rows;

      } else if (roles.includes('MANAGER')) {
        // Managers can see their subordinates
        const employees = await Employee.findAndCountAll({
          where: { managerId: employeeId },
          attributes: [
            'id',
            'empCode',
            'email',
            'name',
            'status',
            'idNumber',
            'managerId',
            'imageId',
            'designation'
          ]
        });

        totalEmployees = employees.count;
        employeeList = employees.rows;

      } else if (roles.includes('USER')) {
        // Regular users can only see themselves
        const employees = await Employee.findAndCountAll({
          where: { id: employeeId },
          attributes: [
            'id',
            'empCode',
            'email',
            'name',
            'status',
            'idNumber',
            'managerId',
            'imageId',
            'designation'
          ]
        });

        totalEmployees = employees.count;
        employeeList = employees.rows;

      } else {
        // If role is not recognized
        throw new Error('Access denied: Unauthorized role');
      }

      return { totalEmployees, employeeList };

    } catch (error) {
      console.error("❌ Error fetching role-wise employees:", error.message);
      throw error;
    }
  }

  static async getEmployeeFromToken(token) {
    try {
      if (!token) throw new Error("Missing access token");

      // Remove "Bearer " prefix if exists
      token = token.replace(/^Bearer\s+/i, "");

      // 🔍 Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Extract user ID (set during login)
      const userId = decoded.id;

      // ✅ Fetch employee and associated role
      const employee = await Employee.findOne({
        where: { id: userId },
        include: [
          {
             model: Role,
             as: 'roles',
             through: { attributes: [] },
           },
          
        ],
      });

      if (!employee) throw new Error("User not found");

      return {
        employee: employee,
        role: employee.roles ? employee.roles[0].role : "Unknown",
      };
    } catch (error) {
      console.error("❌ Token decode error:", error.message);
      throw new Error("Invalid or expired token");
    }
  };

}



module.exports = EmployeeService;