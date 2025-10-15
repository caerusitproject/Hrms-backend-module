const leaveService = require("../services/leaveService");
const { handleLeave } = require('../services/managerService.js');
const applyLeave = async (req, res) => {
  try {
    const leave = await leaveService.applyLeave(req.body);
    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/*exports.manageLeave = async (req, res) => {
  try {
    const { leaveId, action } = req.body; // action = "approve" or "reject"
    const managerId = req.user.id; // from token/middleware

    const leave = await leaveService.approveLeave(leaveId, managerId, action);
    res.status(200).json({ message: `Leave ${action}d successfully`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};*/ //Sir's manage leave module



const approveLeave = async (req, res) => {
  console.log("In approve leave controller");
  const leave = await handleLeave(req.params.id, 'APPROVED');
  res.json(leave);
};

const rejectLeave = async (req, res) => {
  const leave = await handleLeave(req.params.id, 'REJECTED');
  res.json(leave);
};

module.exports = { approveLeave, rejectLeave, applyLeave };

