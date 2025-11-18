// src/workflow/onboardingWorkflow.js
//const { Onboarding } = require("../../models");
const engine = require("./workflowEngine");
const states= require("./workflowStates");
const {Employee, workflow}= require("../../models")
const { sendEmailNotification } = require("../notification/notificationHandler");

exports.startOnboarding = async (data) => {
  //const ob = await Onboarding.create(data);
  const wf = await engine.start(data.processType, data.employeeId,data.initiatorId, states.onboarding.initialState, data.data);
  //ob.workflowId = wf.id; //await ob.save();
  const emp = await Employee.findByPk(data.initiatorId);
  const emp1= await Employee.findByPk(data.employeeId);
  const message={
    type:"Workflow_onboarding_init",
    email: emp.email,
    subject:"Onboarding Process Started",
    payload:{
      name:emp.name,
      message:`Onboarding process has been started for you.`,
      email: emp.email,
      type:"Workflow_onboarding_init",
      onboardingFor:emp1.name,
      onboardingEmpCode:emp1.empCode
    }
  }
  console.log("Sending onboarding email to:", emp.email);
  await sendEmailNotification(message);//"workflow-topic", { type: "ONBOARDING_STARTED", data: { onboardingId: ob.id, message: "Onboarding started" }}
  console.log("Onboarding workflow started with ID:", wf.id);
  return wf;
};

exports.verifyDocs = async (workflowId, verifierId) => {
  const wf= await engine.updateStatus(workflowId, states.onboarding.transitions.in_progress[0], verifierId, "Documents verified for the employees's onboarding process",{"documents":{"idProof":"verified","addressProof":"verified","educationCertificates":"pending","previousEmploymentDocs":"verified"},"overallStatus":"partially_verified","comments":"Education certificates still pending."});
  console.log("Documents verified for onboarding workflow ID:", workflowId);
  const workflow= await workflow.findByPk(workflowId);
  const verifier= await Employee.findByPk(verifierId);
  const employee= await Employee.findByPk(workflow.employeeId);
  const message={
    type:"Workflow_onboarding_docs_verified",
    email: emp.email,
    subject:"Onboarding Process Started",
    payload:{
      name:emp.name,
      message:`Documents have been verified successfully for your onboarding process.`,
      email: verifier.email,
      type:"Workflow_onboarding_docs_verified",
      onboardingFor:employee.name,
      onboardingEmpCode:employee.empCode
    }
  }
  
  await sendEmailNotification(message);
  return ;
};

exports.completeOnboarding = async (onboardingId, actorId) => {
  const ob = await Onboarding.findByPk(onboardingId);
  ob.status = "COMPLETED"; await ob.save();
  await engine.updateStatus(ob.workflowId, "COMPLETED", actorId, "Onboarding completed");
  await sendNotification("workflow-topic", { type: "ONBOARDING_COMPLETED", data: { onboardingId: ob.id }});
  return ob;
};
