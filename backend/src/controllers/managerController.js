const managerService = require('../services/managerService.js');

const getTeamList = async (req, res) => {
  const team = await managerService.getTeam(req.params.id);//-->changed to req.user.id
  res.json(team);
};

const getEmployeeDetails = async (req, res) => {
  const profile = await managerService.getEmployeeProfile(req.params.id);
  res.json(profile);
};

const getEmployeeAttendance = async (req, res) => {
  const attendance = await managerService.getAttendance(req.params.id);
  res.json(attendance);
};

const getDashboardBroadcasts = async (req, res) => {
  const broadcasts = await managerService.getBroadcasts();
  res.json(broadcasts);
};

const getDashboard = async (req, res) => {
  const data = await managerService.getDashboardData(req.params.id);//changed from req.user.id
  res.json(data);
};

module.exports = { getTeamList, getEmployeeDetails, getEmployeeAttendance, getDashboardBroadcasts,getDashboard };