// src/workflow/onboardingWorkflow.js
const { Onboarding } = require("../../models");
const engine = require("./workflowEngine");
//const { sendNotification } = require("../services/notificationProducer");

exports.startOnboarding = async (data) => {
  const ob = await Onboarding.create(data);
  const wf = await engine.start("ONBOARDING", ob.id, data.employeeId, { onboardingId: ob.id });
  ob.workflowId = wf.id; await ob.save();
  await sendNotification("workflow-topic", { type: "ONBOARDING_STARTED", data: { onboardingId: ob.id, message: "Onboarding started" }});
  return ob;
};

exports.verifyDocs = async (onboardingId, verifierId) => {
  const ob = await Onboarding.findByPk(onboardingId);
  if (!ob) throw new Error("Onboarding not found");
  ob.verified = true; ob.status = "VERIFIED"; await ob.save();
  await engine.updateStatus(ob.workflowId, "VERIFIED", verifierId, "Documents verified", { onboardingId });
  await sendNotification("workflow-topic", { type: "ONBOARDING_VERIFIED", data: { onboardingId: ob.id }});
  return ob;
};

exports.completeOnboarding = async (onboardingId, actorId) => {
  const ob = await Onboarding.findByPk(onboardingId);
  ob.status = "COMPLETED"; await ob.save();
  await engine.updateStatus(ob.workflowId, "COMPLETED", actorId, "Onboarding completed");
  await sendNotification("workflow-topic", { type: "ONBOARDING_COMPLETED", data: { onboardingId: ob.id }});
  return ob;
};
