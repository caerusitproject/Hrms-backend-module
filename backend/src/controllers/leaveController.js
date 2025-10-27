const leaveService = require("../services/leaveService");
const managerService = require('../services/managerService.js');
const { get } = require("./workflowController.js");
const applyLeave = async (req, res) => {
  try {
    const leave = await leaveService.applyLeave(req.body);
    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await leaveService.updateLeave(leaveId, req.body);
    res.status(201).json({ message: "Leave updated successfully", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    await leaveService.deleteLeave(leaveId);
    res.status(201).json({ message: "Leave deleted successfully" });
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
  const leave = await managerService.handleLeave(req.params.id, 'APPROVED');
  res.json(leave);
};

const rejectLeave = async (req, res) => {
  const leave = await managerService.handleLeave(req.params.id, 'REJECTED');
  res.json(leave);
};

const getLeavesCount = async (req, res) => {
  try {
    const employeeId = req.user.id;   
    const count = await leaveService.getLeavesCount(employeeId,0);
    res.status(200).json({ employeeId, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

const getLeavesCountMonth = async (req, res) => {
  try {
    const employeeId = req.user.id;   
    const count=await leaveService.getLeavesCount(employeeId,1);
    res.status(200).json({ employeeId, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLeavesList = async (req, res) => {
  try {
    const employeeId = req.user.id; 
    const leaves = await leaveService.getLeavesList(employeeId);
    res.status(200).json({ employeeId, leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};
module.exports = { approveLeave, rejectLeave, applyLeave,updateLeave,deleteLeave, getLeavesCount , getLeavesCountMonth, getLeavesList};

