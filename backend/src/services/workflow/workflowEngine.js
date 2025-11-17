
const { workflowLog, workflowHistory } = require("../../models");
//const { sendNotification } = require("./kafkaProducer");

class WorkflowEngine {
  async start(processType, employeeId, initiatorId, startDate,endDate,reson, data = {}) {
    const wf = await workflowLog.create({ employeeId, payload: {data : `Leave from ${startDate} to ${endDate} for reason: ${reson}`}, processType, status: "INITIATED", initiatedBy: initiatorId}); 
    //.create({ processType, refId, status: "INITIATED", initiatedBy: initiatorId });
    await workflowHistory.create({ workflowId: wf.id, action: "INITIATED", actorId: initiatorId, remarks: "Workflow started" , comment: `Leave from ${startDate} to ${endDate} for reason: ${reson}`});

    //await sendNotification("workflow-topic", { type: `${processType}_STARTED`, data: { workflowId: wf.id, ...data } });
    return wf;
  }

  async updateStatus(workflowId, newStatus, actorId, remarks = "", data = {}) {
    const wf = await workflowLog.findByPk(workflowId);
    if (!wf) throw new Error("Workflow not found");
    wf.status = newStatus;
    await wf.save();
    await workflowHistory.create({ workflowId, action: newStatus, actorId, remarks });
    //await sendNotification("workflow-topic", { type: `WORKFLOW_${newStatus}`, data: { workflowId, ...data } });
    return wf;
  }
}

module.exports = new WorkflowEngine();
