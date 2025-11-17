// src/workflow/leaveWorkflow.js
const LeaveRequest = require("../../models/LeaveRequest");
const engine = require("./workflowEngine");
//const { sendNotification } = require("./kafkaProducer");

exports.startLeave = async (leaveData) => {
  // create leave
    const leave = await LeaveRequest.findByPk(leaveData.id);
  // start workflow
  const wf = await engine.start("LEAVE", leaveData.id, leaveData.employeeId, leaveData.startDate,leaveData.endDate, leaveData.reason );

  if (!leave) throw new Error("Leave request not found");
  // link workflow id
  leave.workflowId = wf.id;
  const updateleave = await leave.save();
  console.log("Leave workflow started with ID:", updateleave.workflowId);
  // notify manager
  /*await sendNotification("workflow-topic", {
    type: "LEAVE_INITIATED",
    data: { leaveId: leaveData.id, employeeId: leaveData.employeeId, managerId: leaveData.managerId, message: "New leave request" }
  });*/
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
