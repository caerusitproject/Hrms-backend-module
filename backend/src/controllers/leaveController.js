const leaveService = require("../services/leaveService");
const managerService = require('../services/managerService.js');
const { get } = require("./workflow/workflowController.js");
const applyLeave = async (req, res) => {
  try {
  const { type, startDate, endDate, reason } = req.body || {};
  const employeeId = req.user.id;

  const leave = await leaveService.applyLeave({
    employeeId,
    type,
    startDate,
    endDate,
    reason
  });

  return res.status(201).json({ message: "Leave applied successfully", leave });

} catch (error) {
  return res.status(500).json({ error: 500, message: error.message });
}
};

const updateLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    if(!leaveId)throw new Error("Leave Id not provided!");
    const leave = await leaveService.updateLeave(leaveId, req.body);
    return res.status(201).json({ message: "Leave updated successfully", leave });
  } catch (error) {
    return res.status(404).json({ error: 404, message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    await leaveService.deleteLeave(leaveId);
    return res.status(201).json({ message: "Leave deleted successfully" });
  } catch (error) {
    return res.status(404).json({ error: 404, message: error.message });
  }
};


const approveLeave = async (req, res) => {
  try {
    const { id, status } = req.query;
    const leave = await managerService.handleLeave(id, status);
    return res.status(200).json(leave);
  } catch (error) {
    return res.status(500).json({ error: 500, message: error.message });
  }
};

// const rejectLeave = async (req, res) => {
//   try {
//     const leave = await managerService.handleLeave(req.params.id, 'REJECTED');
//     return res.status(200).json(leave);
//   }catch (error) {
//     return res.status(500).json({ error: 500, message: error.message });
//   }
  
// };

const getLeavesCount = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const count = await leaveService.getLeavesCount(employeeId, 0);
    return res.status(200).json({ employeeId, count });
  } catch (error) {
    return res.status(404).json({ error:404, message: error.message });
  }
};

const getLeavesCountMonth = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const count = await leaveService.getLeavesCount(employeeId, 1);
    return res.status(200).json({ employeeId, count });
  } catch (error) {
    return res.status(404).json({ error:404, message: error.message });
  }
};

const getLeavesList = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const leaves = await leaveService.getLeavesList(employeeId);
    return res.status(200).json({ employeeId, leaves });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = { approveLeave, applyLeave, updateLeave, deleteLeave, getLeavesCount, getLeavesCountMonth, getLeavesList };

