const leaveService = require("../services/leaveService");

exports.applyLeave = async (req, res) => {
  try {
    const leave = await leaveService.applyLeave(req.body);
    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manageLeave = async (req, res) => {
  try {
    const { leaveId, action } = req.body; // action = "approve" or "reject"
    const managerId = req.user.id; // from token/middleware

    const leave = await leaveService.approveLeave(leaveId, managerId, action);
    res.status(200).json({ message: `Leave ${action}d successfully`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
