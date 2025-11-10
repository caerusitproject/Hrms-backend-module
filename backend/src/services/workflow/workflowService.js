const Employee = require('../../models/Employee');
const WorkflowLog = require('../../models/WorkflowLog');
//const eventPublisher = require('../eventPublisher');
/**
 * Simple synchronous workflow orchestration methods.
 * Extend to publish events (Kafka) or run async tasks as needed.
 */

const TOPICS = {
  OFFER: 'offer-events',
  DOCS: 'document-events',
  VERIFICATION: 'verification-events',
  ONBOARDING: 'onboarding-events',
  INDUCTION: 'induction-events'
};

async function createEmployeeAndOffer(payload) {
  const { name, email, externalId } = payload;
  const emp = await Employee.create({ name, email, externalId, state: 'OFFER_CREATED' });
  await WorkflowLog.create({ employeeId: emp.id, event: 'OfferCreated', payload });
  await eventPublisher.publish(TOPICS.OFFER, 'OfferCreated', { employeeId: emp.id, name, email });
  return emp;
}

async function acceptOffer(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  if (!emp) throw new Error('Employee not found');
  emp.state = 'OFFER_ACCEPTED';
  await emp.save();
  await WorkflowLog.create({ employeeId: emp.id, event: 'OfferAccepted', payload: { employeeId: emp.id } });
  await eventPublisher.publish(TOPICS.OFFER, 'OfferAccepted', { employeeId: emp.id, name: emp.name, email: emp.email });
  return emp;
}

async function uploadDocuments(employeeId, docsMeta = {}) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'DOCS_UPLOADED';
  await emp.save();
  await WorkflowLog.create({ employeeId: emp.id, event: 'DocsUploaded', payload: docsMeta });
  await eventPublisher.publish(TOPICS.DOCS, 'DocsUploaded', { employeeId: emp.id, docsMeta });
  return emp;
}

async function verifyDocuments(employeeId, result = { verified: true }) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'VERIFIED';
  await emp.save();
  await WorkflowLog.create({ employeeId: emp.id, event: 'DocsVerified', payload: result });
  await eventPublisher.publish(TOPICS.VERIFICATION, 'DocsVerified', { employeeId: emp.id, result });
  return emp;
}

async function startOnboarding(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'ONBOARDING';
  await emp.save();
  await WorkflowLog.create({ employeeId: emp.id, event: 'OnboardingStarted', payload: {} });
  await eventPublisher.publish(TOPICS.ONBOARDING, 'OnboardingStarted', { employeeId: emp.id });
  return emp;
}

async function activateEmployee(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'ACTIVE_EMPLOYEE';
  await emp.save();
  await WorkflowLog.create({ employeeId: emp.id, event: 'EmployeeActivated', payload: {} });
  await eventPublisher.publish(TOPICS.ONBOARDING, 'EmployeeActivated', { employeeId: emp.id });
  return emp;
}

async function startInduction(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'INDUCTION_STARTED';
  await emp.save();
  await WorkflowLog.create({ employeeId: emp.id, event: 'InductionStarted', payload: {} });
  await eventPublisher.publish(TOPICS.INDUCTION, 'InductionStarted', { employeeId: emp.id });
  return emp;
}

module.exports = {
  createEmployeeAndOffer,
  acceptOffer,
  uploadDocuments,
  verifyDocuments,
  startOnboarding,
  activateEmployee,
  startInduction
};