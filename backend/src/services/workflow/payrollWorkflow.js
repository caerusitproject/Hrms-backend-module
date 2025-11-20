// src/workflow/payrollWorkflow.js
const { Payroll } = require("../../models");
const engine = require("./workflowEngine");
//const { sendNotification } = require("../");

exports.initiatePayroll = async (payrollData) => {
  const p = await Payroll.create(payrollData);
  const wf = await engine.start("PAYROLL", p.id, payrollData.employeeId,payrollData.initiatedBy || null,  { payrollId: p.id });
  p.workflowId = wf.id; await p.save();
  //await sendNotification("workflow-topic", { type: "PAYROLL_INITIATED", data: { payrollId: p.id }});
  return p;
};

exports.generatePayslip = async (payrollId) => {
  const p = await Payroll.findByPk(payrollId);
  if (!p) throw new Error("Payroll not found");
  // here you would calculate and save payslip; we'll just set status
  p.status = "PAYSLIP_GENERATED"; await p.save();
  await engine.updateStatus(p.workflowId, "PAYSLIP_GENERATED", null, "Payslip generated");
  //await sendNotification("workflow-topic", { type: "PAYROLL_PAYSLIP_GENERATED", data: { payrollId: p.id }});
  return p;
};

exports.sendPayslip = async (payrollId, email) => {
  const p = await Payroll.findByPk(payrollId);
  p.status = "PAYSLIP_SENT"; await p.save();
  await engine.updateStatus(p.workflowId, "PAYSLIP_SENT", null, "Payslip sent");
  //await sendNotification("workflow-topic", { type: "PAYROLL_PAYSLIP_SENT", data: { payrollId: p.id, recipientEmail: email, message: "Your payslip is ready" }});
  return p;
};
