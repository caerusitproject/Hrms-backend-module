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
  static async createEmployee(payload) {
    logger.info("Creating a new employee");
    //await this.initKafka();
    // if no joining_date provided, set to today
    if (!payload.joining_date) {
      payload.joining_date = new Date();
    }
    try {
      if (payload.password) {
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        payload.password = hashedPassword;
      }
    } catch (err) {
      logger.error("Error hashing password: " + err.message);
      throw new Error("Error hashing password: " + err.message);
    }

    if (!payload.managerId) payload.managerId = 1;
    const roleIds = payload.roleIds;
    const employee = await Employee.create(payload);
    if (roleIds) {
      await EmployeeRole.create({ employeeId: employee.id, roleId: roleIds });
      logger.info(`Assigned roles ${roleIds} to employee with ID ${employee.id}`);
    }

    try {
      logger.info(`Sending email notification to ${employee.email} for employee registration.`);
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
      const payload ={
        processType: "ONBOARDING",
        employeeId: employee.id,
        initiatorId: id, 
        data: message
      }
      const ob= await  startOnboarding(payload);
        
    } catch (error) {
      logger.error("Error sending email notification: " + error.message);
    }
    logger.info(`Email notification sent to ${employee.email} for employee registration.`);
    

    return employee;
  }

  static async getAllEmployeesPag(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const total = await Employee.count({ where: { status: 'Active' } });
    logger.info(`Total active employees: ${total}`);

    if (total === 0) {
      return {
        message: "No active employees found",
        employees: [],
        pagination: null
      };
    }

    logger.info(`Fetching active employees for page ${page} with limit ${limit}`);
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
    logger.info(`Fetching employee with ID ${id}`);
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


  /*static async updateEmployee(id, updates) {
   const employee = await Employee.findByPk(id);

    if (!employee) throw new Error("Employee not found");
    await employee.update(updates);
    return employee;
  }*/

  static async updateEmployee(employeeId, data) {
    logger.info(`Updating employee with ID ${employeeId}`);
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Allowed fields to update
    const allowedFields = [
      "name",
      "email",
      "mobile",
      "address",
      "designation",
      "dob",
      "joiningDate",
      "managerId",
      "departmentId"
    ];

    // Filter only allowed fields
    const updatePayload = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updatePayload[key] = data[key];
      }
    }
    logger.info(`Filtered update payload for employee ID ${employeeId}: ${JSON.stringify(updatePayload)}`);
  

    // Handle role update if provided
    
    if (data.roleIds) {
      const roledata = await EmployeeRole.findOne({ where: { employeeId } });
      roledata.roleId = data.roleIds;
      await EmployeeRole.update(roledata.dataValues, { where: { employeeId }  });
      logger.info(`Updated roles for employee ID ${employeeId} to ${data.roleIds}`);
    }

      // Update employee main table
    await employee.update(updatePayload);
    logger.info(`Employee with ID ${employeeId} updated successfully.`);
    // Fetch updated employee with relations
    const updatedEmployee =  await Employee.findOne({
      where: { id: employeeId },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "departmentName"],
        },
        
        {
          model: Role,
          as: "roles", // 👈 use the belongsToMany alias
          attributes: ["id", "name", "role"],
          through: { attributes: [] }, // hide join table columns
        },
      ],
    });

    logger.info(`Employee with ID ${employeeId} updated successfully.`);
    return updatedEmployee;

  }

  static async removeEmployee(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error("Employee not found");
    employee.status = 'Inactive';
    logger.info(`Employee with ID ${id} marked as Inactive.`);
    await employee.save();
    return true;
  }



  static async uploadEmployeeImage(id, imagePath) {
    try {
      logger.info(`Uploading image for employee with ID ${id}`);
      const employee = await Employee.findByPk(id);
      if (!employee) throw new Error("Employee not found");

      employee.imageUrl = imagePath;
      await employee.save();
      logger.info(`Image uploaded for employee with ID ${id}`);
      return employee;
    } catch (err) {
      logger.error(`Error uploading image for employee with ID ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Delete an employee
   * @param {Number} id
   * @returns {Promise<Boolean>}
   */
  static async deleteEmployee(id) {
    logger.info(`Deleting employee with ID ${id}`);
    const deleted = await Employee.destroy({ where: { id } });
    logger.info(`Employee with ID ${id} deleted.`);
    return deleted > 0;
  }

  

  static async getSubordinates(managerId) {
    logger.info(`Fetching subordinates for manager with ID ${managerId}`);
    try {
      // Validate input
      if (!managerId) {
        throw new Error('Manager ID is required');
      }
      logger.info(`Fetching subordinates for manager with ID ${managerId}`);
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
       
        logger.error(`Manager with ID ${managerId} not found`);
        throw new Error('Manager not found');
      }

      return manager;
    } catch (error) {
      logger.error(`❌ Error fetching manager with employees: ${error.message}`);
      throw error;
    }
  }

  static async assignManager(employeeId, managerId) {
    logger.info(`Assigning manager with ID ${managerId} to employee with ID ${employeeId}`);
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new Error("Employee not found");
    const manager = await Employee.findByPk(managerId);
    logger.info(`Assigning manager with ID ${managerId} to employee with ID ${employeeId}`);
    if (!manager) throw new Error("Manager not found");
    employee.managerId = managerId;
    logger.info(`Manager with ID ${managerId} assigned to employee with ID ${employeeId}`);
    await employee.save();
    logger.info(`Employee with ID ${employeeId} saved after assigning manager with ID ${managerId}`);
    return employee;
  }

  // 🔍 Get all employees who are Managers
  static async getAllManagers() {
    logger.info("Fetching all managers");
    try {
      logger.info("Attempting to retrieve all managers from the database");
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
        attributes: ['id', 'name', 'email', 'managerId'],
      });
      logger.info(`Retrieved ${managers.length} managers from the database`);


      return managers;
    } catch (error) {
      logger.error("Error fetching managers:", error);
      throw error;
    }
  }




  // 🧠 Get a specific manager by ID
  static async getManagerById(managerId) {
    logger.info(`Fetching manager with ID ${managerId}`);
    try {
      const manager = await Employee.findOne({
        where: { id: managerId },
        include: [
          {
             model: Role,
             as: 'roles',
             where: { name: 'MANAGER_ROLE' },
             through: { attributes: [] },
           },
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'departmentName'],
          }
        ],
      });
      logger.info(`Fetched manager with ID ${managerId}`);
      if (!manager) {
        logger.error(`Manager with ID ${managerId} not found`);
        throw new Error(`Manager with ID ${managerId} not found`);
      }

      return manager;
    } catch (error) {
      logger.error(`❌ Error fetching manager by ID: ${error.message}`);
      throw error;
    }
  }



  static async getEmployeeDetailsById(employeeId) {
    logger.info(`Fetching employee details for ID: ${employeeId}`);
    if (!employeeId) {
      logger.error("No employee ID provided. Please provide a valid employee ID");
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
        logger.error(`No employee record found for the corresponding Employee ID: ${employeeId}`);
        throw new Error("NO employee record found for the coreesponding Employee ID.");
      }
      return employee;
    } catch (error) {
      logger.error(`❌ Error fetching employee details by ID: ${error.message}`);
      throw error;
    }
  };


  static async getAllManagersWithEmployees() {
    logger.info("Fetching all managers with their employees");
    try {
      logger.info("Attempting to retrieve all managers with their employees from the database");
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
        logger.warn("No managers with employees found in the database");
        return { message: "Employee list is empty" };
      }
      return managers;
    } catch (error) {
      logger.error(`❌ Error fetching managers with employees: ${error.message}`);
      throw error;
    }
  }

  static async getAllRoleWiseEmployees(employeeId, roles) {
    logger.info(`Fetching employees for employee ID ${employeeId} with roles: ${roles.join(", ")}`);
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
        logger.info(`Fetched ${employees.count} employees for manager ID ${employeeId}`);
        totalEmployees = employees.count;
        employeeList = employees.rows;

      } else if (roles.includes('USER')) {
        // Regular users can see only their own record
        logger.info(`Fetching employee record for user ID ${employeeId}`);
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
        logger.error(`Unauthorized role(s) provided: ${roles.join(", ")}`);
        throw new Error('Access denied: Unauthorized role');
      }
      
      return { totalEmployees, employeeList };

    } catch (error) {
      logger.error(`❌ Error fetching role-wise employees: ${error.message}`);
      throw error;
    }
  }

  static async getEmployeeFromToken(token) {
    try {
      if (!token) throw new Error("Missing access token");

      logger.info("Removing 'Bearer ' prefix from token if present");
      // Remove "Bearer " prefix if exists
      token = token.replace(/^Bearer\s+/i, "");

      logger.info("Decoding and verifying token");
      // 🔍 Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      logger.info("Extracting user ID from decoded token");
      // Extract user ID (set during login)
      const userId = decoded.id;

        logger.info(" ✅  Fetching employee and associated role");
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
      logger.info("Employee and associated role fetched successfully");
      if (!employee) {
        logger.error("User not found");
        throw new Error("User not found");
      }
      
      return {
        employee: employee,
        role: employee.roles ? employee.roles[0].role : "Unknown",
      };
    } catch (error) {
      logger.error(`❌ Token decode error: ${error.message}`);
      throw new Error("Invalid or expired token");
    }
  };

}



module.exports = EmployeeService;