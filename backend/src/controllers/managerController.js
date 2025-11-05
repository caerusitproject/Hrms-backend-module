const managerService = require('../services/managerService.js');
const employeeService = require('../services/employeeService.js');
const { getAllBroadcastsOnly } = require('../services/broadcastService.js');

const getTeamList = async (req, res) => {
  try {
    const team = await managerService.getTeam(req.user.id);//-->changed to req.user.id
    return res.status(200).json(team);
  } catch (error) {
    return res.status(401).json({ error: 401, message: error.message });
  }
};

const getEmployeeDetails = async (req, res) => {
  try {
    const profile = await employeeService.getEmployeeDetailsById(req.params.id);
    return res.status(200).json({ message: "Employee details retrieved successfully", profile });
  } catch (error) {
    return res.status(404).json({ error: 404, message: error.message });
  }
};

const getEmployeeAttendance = async (req, res) => {
  try {
    const empCode = req.params.id;
    const attendance = await managerService.getAttendance(empCode);

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({
      error: 500,
      message: error.message
    });
  }
};

const getDashboardBroadcasts = async (req, res) => {
  const page = req.query.page;
  const limit = req.query.limit;
  if (limit < 1 || limit > 100) { return res.json(400).status({ error: 400, message: "Limit should always be 1 and 100" }) }
  if (page < 1) { return res.status(400).json({ error: 400, message: "Page should always be greater than 0" }) }
  try {
    const broadcasts = await getAllBroadcastsOnly(page, limit);
    return res.status(200).json(broadcasts);
  } catch (error) {
    return res.status(500).json()

  }
};

const getDashboard = async (req, res) => {
  try {
    const data = await managerService.getDashboardData(req.user.id);
    return res.status(200).json(data);
  }catch(error){
    return res.status(500).json({error:500, message: error.message });
  }

  
};

module.exports = { getTeamList, getEmployeeDetails, getEmployeeAttendance, getDashboardBroadcasts, getDashboard };