const Leave = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const { Op } = require("sequelize");
const leaveWorkflow = require("./workflow/leaveWorkflow");

exports.applyLeave = async (data) => {
  try {
    const { employeeId, startDate, endDate, reason } = data;

    if (!startDate) throw new Error("Start date is required");
    if (!endDate) throw new Error("End date is required");
    if (!reason || reason.trim() === "") throw new Error("Reason is required");

    // === Entity Validation ===
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new Error("Employee not found");

    const managerId = employee.managerId;
    data.managerId = managerId;
    //if (!manager) throw new Error("Manager not found");
    const manager = await Employee.findByPk(managerId);
    /*const emailDetails = {
      subject: "Leave Application Received",
      text: `Employee ${employee.name} applied for leave from ${data.startDate} to ${data.endDate}.
Reason: ${data.reason}`,
    };

    if (!manager) {
      console.warn(`Manager not found for employee ID: ${employeeId}`);
      await sendEmail("HR@caerusit.com", emailDetails.subject, emailDetails.text);
    } else {
      console.log(`Manager found: ${manager.name} (${manager.email})`);
      await sendEmail(manager.email, emailDetails.subject, emailDetails.text);
    }*/
    // === Create Leave Record ===
    const leave = await Leave.create(data);

    // === Start Leave Workflow ===
   const leaveInfo = await leaveWorkflow.startLeave({
      id: leave.id,
      employeeId: employee.id,
      managerId: manager.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    });

    return leave;
  } catch (err) {
    // Pass the error to your existing error handler
    throw err;
  }
};



exports.approveLeave = async (leaveId, managerId, action) => {
  const leave = await Leave.findByPk(leaveId, {
    include: [
      { model: Employee, as: "employee" },
      { model: Employee, as: "manager" },
    ],
  });

  if (!leave) throw new Error("Leave not found");
  leave.status = action;
  

  // Update workflow status
  if (action === "APPROVED") {
    await leaveWorkflow.approveLeave(leaveId, managerId, leave.status, "Leave approved");
  } else if (action === "REJECTED") {
    await leaveWorkflow.rejectLeave(leaveId, managerId, leave.status, "Leave rejected");
  }
}

exports.getLeavesCount = async (employeeId, flag) => {
  const emp = Employee.findByPk(employeeId);
  if (!emp) throw new Error('Employee not found');

  let startOfYear = 0;
  let endOfYear = 0;
  const now = new Date();
  if (flag == 0) {
    startOfYear = new Date(new Date().getFullYear(), 0, 1);
    endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
  } else {
    startOfYear = new Date(now.getFullYear(), now.getMonth(), 1);
    endOfYear = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  const statuses = ["PENDING", "APPROVED", "REJECTED"];
  const result = {};
  for (const status of statuses) {
    const count = await Leave.count({
      where: {
        employeeId,
        status,
        startDate: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
    });
    result[status] = count;
  }
  return result;
};

exports.getLeavesList = async (employeeId) => {
  const leaves = await Leave.findAll({
    where: { employeeId },
    attributes: ['id', 'startDate', 'endDate', 'reason', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
 // if (leaves.length === 0) { return { message: 'No leave requests found', leaves: [] }; }
  return leaves;
};

exports.updateLeave = async (leaveId, updatedData) => {
  const leave = await Leave.findByPk(leaveId);
  if (!leave) {
    throw new Error("Leave record not found");
  }
  await leave.update(updatedData);
  return leave;
};

exports.deleteLeave = async (leaveId) => {
  const leave = await Leave.findByPk(leaveId);
  if (!leave) {
    throw new Error("Leave record not found");
  }
  await leave.destroy();
  return true;
};
