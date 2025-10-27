const Leave = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const producer = require("../config/kafka/emailProducer");
const { Op } = require("sequelize");

exports.applyLeave = async (data) => {

  const leave = await Leave.create(data);

  const employee = await Employee.findByPk(data.employeeId);
  const manager = await Employee.findByPk(data.managerId);


  //publish event 
  // Send email to manager

  // if (manager) {
  //   const sendEmailEvent = ({
  //     to: manager.email,
  //     subject: "Leave Application Received",
  //     text: `Employee ${employee.name} applied for leave from ${data.startDate} to ${data.endDate}.\nReason: ${data.reason}`,
  //   });
  //   producer.sendEvent(sendEmailEvent);

  // }


  return leave;
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
  await leave.save();

  // Publish approval/rejection event
  /* await producer.connect();
   await producer.send({
     topic: "leave-events",
     messages: [
       {
         value: JSON.stringify({
           eventType: `LEAVE_${status}`,
           leaveId: leave.id,
           employee: {
             name: `${leave.employee.firstName} ${leave.employee.lastName}`,
             email: leave.employee.email,
           },
           manager: {
             name: `${leave.manager.firstName} ${leave.manager.lastName}`,
             email: leave.manager.email,
           },
           startDate: leave.startDate,
           endDate: leave.endDate,
         }),
       },
     ],
   });*/

  return leave;
};

exports.getLeavesCount = async (employeeId, flag) => {
  let startOfYear= 0;
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
  return { message: "Leave record deleted successfully" };
};
