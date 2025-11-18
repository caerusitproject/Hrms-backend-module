
const { workflow, workflowHistory } = require("../../models");
class WorkflowEngine {
  async start(processType, employeeId, initiatorId, status, data = {}) {
    const wf = await workflow.create({ employeeId, payload: data, processType, status, initiatedBy: initiatorId}); 
    //.create({ processType, refId, status: "INITIATED", initiatedBy: initiatorId });
    await workflowHistory.create({ workflowId: wf.id, action: status, actorId: initiatorId, remarks: "Workflow started" , comment:data.data });
    return wf;
  }

  async updateStatus(workflowId, newStatus, actorId, remarks = "", data = {}) {
    const wf = await workflow.findByPk(workflowId);
    if (!wf) throw new Error("Workflow not found");
    wf.status = newStatus;
    await wf.save();
    await workflowHistory.create({ workflowId, action: newStatus, actorId, remarks });
    //await sendNotification("workflow-topic", { type: `WORKFLOW_${newStatus}`, data: { workflowId, ...data } });
    return wf;
  }
}

module.exports = new WorkflowEngine();
