const Leave = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const producer = require("../config/kafka/emailProducer");

exports.applyLeave = async (data) => {
  
  const leave = await Leave.create(data);

  const employee = await Employee.findByPk(data.employeeId);
  const manager = await Employee.findByPk(data.managerId);
  

  //publish event 
  // Send email to manager

  if (manager) {
    const sendEmailEvent = ({
      to: manager.email,
      subject: "Leave Application Received",
      text: `Employee ${employee.name} applied for leave from ${data.startDate} to ${data.endDate}.\nReason: ${data.reason}`,
    });
    producer.sendEvent(sendEmailEvent);
    
  }

  
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