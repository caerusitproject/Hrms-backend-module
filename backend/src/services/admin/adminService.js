const { Employee, Role, Department, EmployeeRole } = require("../../models");
const bcrypt = require("bcrypt");
class AdminService {
  // 🔹 Create a new role
  static async createRole(roleName, description) {
    const existing = await Role.findOne({ where: { roleName } });
    if (existing) throw new Error("Role already exists");

    return Role.create({ roleName, description });
  }

  // 🔹 Get all roles
  static async getAllRoles() {
    return Role.findAll();
  }

  // 🔹 Delete a role
  static async deleteRole(roleId) {
    return Role.destroy({ where: { id: roleId } });
  }

  // Create Department (Admin adding Department)

  static async createDepartment(data) {
    return Department.create(data);
  }


  // 🔹 Create employee (Admin adding directly)
  static async createEmployee({ name, email, password, departmentId, roleIds }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const emp = await Employee.create({ name, email, password: hashedPassword, departmentId });

    if (roleIds && roleIds.length > 0) {
      await Promise.all(
        roleIds.map((roleId) => EmployeeRole.create({ employeeId: emp.id, roleId }))
      );
    }

    return emp;
  }

  // 🔹 Update employee details
  static async updateEmployee(id, updateData) {
    const emp = await Employee.findByPk(id);
    if (!emp) throw new Error("Employee not found");

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await emp.update(updateData);
    return emp;
  }

  // 🔹 Delete employee
  static async deleteEmployee(id) {
    return Employee.destroy({ where: { id } });
  }

  // 🔹 Assign roles to employee
  static async assignRoles(employeeId, roleIds) {
    const emp = await Employee.findByPk(employeeId);
    if (!emp) throw new Error("Employee not found");

    // Remove old mappings first
    await EmployeeRole.destroy({ where: { employeeId } });

    await Promise.all(
      roleIds.map((roleId) => EmployeeRole.create({ employeeId, roleId }))
    );

    return this.getEmployeeWithRoles(employeeId);
  }

  // 🔹 Fetch employee with roles
  static async getEmployeeWithRoles(employeeId) {
    return Employee.findByPk(employeeId, {
      include: [{ model: Role, as: "roles", through: { attributes: [] } }],
    });
  }
}


/*
const adminService = {
  async getAllEmployees() {
    return Employee.findAll({ include: ["department", "roles"] });
  },

  async createDepartment(data) {
    return Department.create(data);
  },

  async createRole(data) {
    const existing = await Role.findOne({ where: { roleName : data.roleName } });
    if (existing) throw new Error("Role already exists");
    return Role.create(data);
  },

  async approveLeave(leaveId, adminId) {
    const leave = await LeaveRequest.findByPk(leaveId);
    if (!leave) throw new Error("Leave request not found");

    leave.status = "APPROVED";
    leave.approvedBy = adminId;
    await leave.save();

    /*await producer.send({
      topic: "notification_topic",
      messages: [
        {
          value: JSON.stringify({
            type: "LEAVE_APPROVAL",
            to: leave.employeeEmail,
            subject: "Leave Approved",
            body: `Your leave request has been approved by Admin.`,
          }),
        },
      ],
    });

    return leave;
  },

  async rejectLeave(leaveId, adminId, reason) {
    const leave = await LeaveRequest.findByPk(leaveId);
    if (!leave) throw new Error("Leave request not found");

    leave.status = "REJECTED";
    leave.rejectionReason = reason;
    leave.approvedBy = adminId;
    await leave.save();

    /*await producer.send({
      topic: "notification_topic",
      messages: [
        {
          value: JSON.stringify({
            type: "LEAVE_REJECTION",
            to: leave.employeeEmail,
            subject: "Leave Rejected",
            body: `Your leave request has been rejected. Reason: ${reason}`,
          }),
        },
      ],
    });

    return leave;
  },
};*/

module.exports = AdminService;