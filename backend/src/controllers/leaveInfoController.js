const leaveInfoService = require("../services/leaveInfoService");
const addOrUpdateLeave = async (req, res) => {
  try {
    const {employeeId, ...data} = req.body;
    if(!employeeId){return res.status(400).json({error:400, message: "Employee ID is required"});}
    const leaveInfo = await leaveInfoService.addOrUpdateLeave(employeeId, data);
    res.status(201).json({ message: "Leaves added successfully", leaveInfo });
  } catch (error) {
    res.status(404).json({ error:404, message: error.message });
  }
};

const getAllLeaveInfo = async (req, res) => {
  try {
    const leaveInfoList = await leaveInfoService.getAllLeaveInfo();
    res.status(200).json({ message: "Leaves data retrieved successfully", leaveInfoList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLeaveInfoByEmployee = async (req, res) => {
  try {
    const  employeeId  = req.params.id;      
    const leaveInfo = await leaveInfoService.getLeaveInfoByEmployee(employeeId);
    if (!leaveInfo) {
      return res.status(404).json({ message: "Leave records not found for the employee" });
    }
    res.status(200).json({ message: "Leave info retrieved successfully", leaveInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLeaveInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await leaveInfoService.deleteLeaveInfo(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { addOrUpdateLeave, getAllLeaveInfo, getLeaveInfoByEmployee, deleteLeaveInfo };