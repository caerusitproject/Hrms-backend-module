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
  const workflow2= await workflow.findByPk(workflowId);
  const verifier= await Employee.findByPk(verifierId);
  const employee= await Employee.findByPk(workflow2.employeeId);
  const message={
    type:"Workflow_onboarding_docs_verified",
    email: verifier.email,
    subject:"Onboarding Process Started",
    payload:{
      name:verifier.name,
      message:`Documents have been verified successfully for your onboarding process.`,
      email: verifier.email,
      type:"Workflow_onboarding_docs_verified",
      onboardingFor:employee.name,
      onboardingEmpCode:employee.empCode
    }
  }
  
  await sendEmailNotification(message);
  return wf;
};

exports.completeOnboarding = async (workflowId, verifierId) => {
  const wf= await engine.updateStatus(workflowId, states.onboarding.transitions.in_progress[0], verifierId, "All the intermediate steps have been completed for the onBoarding process. The employee is now inducted ",{"documents":{"idProof":"verified","addressProof":"verified","educationCertificates":"verified","previousEmploymentDocs":"verified"},"overallStatus":"Inducted","comments":"Documents Verified  successfully."});
  console.log("Documents verified for onboarding workflow ID:", workflowId);
  const workflow2= await workflow.findByPk(workflowId);
  const verifier= await Employee.findByPk(verifierId);
  const employee= await Employee.findByPk(workflow2.employeeId);
  const message={
    type:"Workflow_onboarding_completed",
    email: verifier.email,
    subject:"Onboarding Process Completed",
    payload:{
      name:verifier.name,
      message:`The employee has been successfully verified.`,
      email: verifier.email,
      type:"Workflow_onboarding_completed",
      onboardingFor:employee.name,
      onboardingEmpCode:employee.empCode
    }
  }
  
  await sendEmailNotification(message);
  return wf;
};
