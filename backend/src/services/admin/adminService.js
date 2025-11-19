const { stat } = require("fs");
const {
  Employee,
  Role,
  Department,
  EmployeeRole,
  User,
} = require("../../models");
const bcrypt = require("bcrypt");
class AdminService {
  // 🔹 Create a new role
  static async createRole(name, role) {
    const existing = await Role.findOne({ where: { name } });
    if (existing) return "Role already exists";
    const roledata = await Role.create({ name, role });
    return roledata;
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
  static async createEmployee({
    name,
    email,
    password,
    departmentId,
    roleIds,
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const emp = await Employee.create({
      name,
      email,
      password: hashedPassword,
      departmentId,
    });

    if (roleIds && roleIds.length > 0) {
      await Promise.all(
        roleIds.map((roleId) =>
          EmployeeRole.create({ employeeId: emp.id, roleId })
        )
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

  // Fetch default users

  static async getAllUsers() {
    const data = await User.findAll({
      attributes: ["id", "username", "email", "roleId"],
      include: [{ model: Role, as: "role", attributes: ["role"] }],
    });

    const users = data.map((user) => {
      const {
        id,
        username,
        email,
        roleId,
        role: { role },
      } = user; // destructure here
      return { id, username, email, roleId, role };
    });

    return users;
  }

  static async updateUserRole(id, username, email) {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        status: false,
        message: "User not found",
        data: null,
      };
    }

    await user.update({ username, email });

    return {
      status: true,
      message: "User updated successfully",
      data: user,
    };
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
