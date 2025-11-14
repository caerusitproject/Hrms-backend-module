
const { workflowLog, workflowHistory } = require("../../models");
//const { sendNotification } = require("./kafkaProducer");

class WorkflowEngine {
  async start(processType, refId,employeeId, initiatorId, startDate,EndDate,reson, data = {}) {
    const wf = await workflowLog.create({ processType, refId,employeeId, status: "INITIATED", initiatedBy: initiatorId ,startDate: startDate,endDate:EndDate, reson:reson}); 
    //.create({ processType, refId, status: "INITIATED", initiatedBy: initiatorId });
    await workflowHistory.create({ workflowId: wf.id, action: "INITIATED", actorId: initiatorId, remarks: "Workflow started" , comment: `Leave from ${startDate} to ${EndDate} for reason: ${reson}`});

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
