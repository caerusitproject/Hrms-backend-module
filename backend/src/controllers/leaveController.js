const LeaveRequest = require('../models/LeaveRequest');

async function createLeave(req, res) {
  try {
    const { employeeId } = req.params;
    const { leaveType, fromDate, toDate, days, reason } = req.body;
    const lr = await LeaveRequest.create({ employeeId, leaveType, fromDate, toDate, days, reason });
    return res.status(201).json(lr);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function listLeaves(req, res) {
  try {
    const leaves = await LeaveRequest.findAll();
    return res.json(leaves);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createLeave, listLeaves };
