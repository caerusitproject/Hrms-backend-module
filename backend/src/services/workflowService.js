const Employee = require('../models/Employee');
/**
 * Simple synchronous workflow orchestration methods.
 * Extend to publish events (Kafka) or run async tasks as needed.
 */

async function createOffer(payload) {
  const { name, email, empCode, department, designation } = payload;
  const emp = await Employee.create({ name, email, empCode, department, designation, state: 'OFFER_CREATED' });
  return emp;
}

async function acceptOffer(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  if (!emp) throw new Error('Employee not found');
  emp.state = 'OFFER_ACCEPTED';
  await emp.save();
  return emp;
}

async function uploadDocs(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'DOCS_UPLOADED';
  await emp.save();
  return emp;
}

async function verifyDocs(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'VERIFIED';
  await emp.save();
  return emp;
}

async function startOnboarding(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'ONBOARDING';
  await emp.save();
  return emp;
}

async function activateEmployee(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'ACTIVE';
  emp.joiningDate = new Date();
  await emp.save();
  return emp;
}

async function startInduction(employeeId) {
  const emp = await Employee.findByPk(employeeId);
  emp.state = 'INDUCTION_STARTED';
  await emp.save();
  return emp;
}

module.exports = {
  createOffer,
  acceptOffer,
  uploadDocs,
  verifyDocs,
  startOnboarding,
  activateEmployee,
  startInduction
};
