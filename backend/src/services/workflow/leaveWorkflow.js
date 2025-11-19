// src/workflow/leaveWorkflow.js
const LeaveRequest = require("../../models/LeaveRequest");
const engine = require("./workflowEngine");
const sendEmailNotification = require("../../services/notification/notificationHandler")
//const { sendNotification } = require("./kafkaProducer");
exports.startLeave = async (leaveData) => {
  // create leave
    const leave = await LeaveRequest.findByPk(leaveData.id);
  // start workflow
  const wf = await engine.start("LEAVE", leaveData.id, leaveData.employeeId, leaveData.startDate,leaveData.endDate, leaveData.reason,{data : `Leave from ${leaveData.startDate} to ${leaveData.endDate} for reason: ${leaveData.reason}`} );

  if (!leave) throw new Error("Leave request not found");
  // link workflow id
  leave.workflowId = wf.id;
  const updateleave = await leave.save();
  console.log("Leave workflow started with ID:", updateleave.workflowId);
  // notify manager
 
     
  sendEmailNotification(message);
  return updateleave;
};

exports.approveLeave = async (leaveId, managerId, status, remarks) => {
  const workflow = await LeaveRequest.findByPk(leaveId); 
  await engine.updateStatus(workflow.id, status, managerId, remarks, { leaveId });
  //await sendNotification("workflow-topic", { type: "LEAVE_APPROVED", data: { leaveId, employeeId: leave.employeeId, managerId, message: remarks } });
  return null;
};

exports.rejectLeave = async (leaveId, managerId, remarks) => {
  const leave = await LeaveRequest.findByPk(leaveId);
  if (!leave) throw new Error("Leave not found");
  leave.status = "REJECTED";
  leave.remarks = remarks;
  await leave.save();
  await engine.updateStatus(leave.workflowId, "REJECTED", managerId, remarks, { leaveId });
  //await sendNotification("workflow-topic", { type: "LEAVE_REJECTED", data: { leaveId, employeeId: leave.employeeId, managerId, message: remarks } });
  return leave;
};
// exports.setPayload = async (workflowId, payload) => {
//  return   message = {
//         type: 'LEAVE_APPLY',
//         email: employee.email,
//         subject: 'Welcome to HRMS!',
//         template: 'employee_welcome',
//         payload: {
//           name: employee.name,
//           department: employee.departmentId,
//           email: employee.email,
//           type: "employee_registration",
//           empCode: employee.empCode
//         },
//       };
// };