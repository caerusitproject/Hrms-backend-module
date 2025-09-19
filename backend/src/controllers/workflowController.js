const workflow = require('../services/workflowService');

async function startWorkflow(req, res) {
  try {
    const emp = await workflow.createOffer(req.body);
    return res.status(201).json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function acceptOffer(req, res) {
  try {
    const emp = await workflow.acceptOffer(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function uploadDocs(req, res) {
  try {
    const emp = await workflow.uploadDocs(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function verifyDocs(req, res) {
  try {
    const emp = await workflow.verifyDocs(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function onboard(req, res) {
  try {
    const emp = await workflow.startOnboarding(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function activate(req, res) {
  try {
    const emp = await workflow.activateEmployee(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function induction(req, res) {
  try {
    const emp = await workflow.startInduction(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { startWorkflow, acceptOffer, uploadDocs, verifyDocs, onboard, activate, induction };
