const express = require('express');
const router = express.Router();
const workflow = require('../services/workflowService');

// start workflow: creates employee & sends offer
router.post('/start', async (req, res) => {
  try {
    const emp = await workflow.createEmployeeAndOffer(req.body);
    return res.status(201).json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// accept offer
router.post('/:id/accept', async (req, res) => {
  try {
    const emp = await workflow.acceptOffer(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// upload docs
router.post('/:id/documents', async (req, res) => {
  try {
    const emp = await workflow.uploadDocuments(req.params.id, req.body);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// verify
router.post('/:id/verify', async (req, res) => {
  try {
    const emp = await workflow.verifyDocuments(req.params.id, req.body);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// onboarding steps
router.post('/:id/onboard', async (req, res) => {
  try {
    const emp = await workflow.startOnboarding(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/activate', async (req, res) => {
  try {
    const emp = await workflow.activateEmployee(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/induction', async (req, res) => {
  try {
    const emp = await workflow.startInduction(req.params.id);
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;