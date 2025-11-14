// src/workflow/documentWorkflow.js
const { Document } = require("../models");
const engine = require("./workflowEngine");
//const { sendNotification } = require("../services/notificationProducer");

exports.uploadDocument = async (docData) => {
  const d = await Document.create(docData);
  const wf = await engine.start("DOCUMENT", d.id, docData.employeeId, { documentId: d.id });
  d.workflowId = wf.id; await d.save();
  await sendNotification("workflow-topic", { type: "DOCUMENT_UPLOADED", data: { documentId: d.id }});
  return d;
};

exports.verifyDocument = async (docId, verifierId) => {
  const d = await Document.findByPk(docId);
  d.verified = true; await d.save();
  await engine.updateStatus(d.workflowId, "VERIFIED", verifierId, "Document verified");
  await sendNotification("workflow-topic", { type: "DOCUMENT_VERIFIED", data: { documentId: d.id }});
  return d;
};

exports.rejectDocument = async (docId, verifierId, reason) => {
  const d = await Document.findByPk(docId);
  d.verified = false; d.status = "REJECTED"; await d.save();
  await engine.updateStatus(d.workflowId, "REJECTED", verifierId, reason);
  await sendNotification("workflow-topic", { type: "DOCUMENT_REJECTED", data: { documentId: d.id, message: reason }});
  return d;
};
