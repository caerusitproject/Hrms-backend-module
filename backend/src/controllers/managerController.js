const { getTeam, getEmployeeProfile, getAttendance, getBroadcasts, getDashboardData } = require('../services/managerService.js');

const getTeamList = async (req, res) => {
  const team = await getTeam(req.params.id);//-->changed to req.user.id
  res.json(team);
};

const getEmployeeDetails = async (req, res) => {
  const profile = await getEmployeeProfile(req.params.id);
  res.json(profile);
};

const getEmployeeAttendance = async (req, res) => {
  const attendance = await getAttendance(req.params.id);
  res.json(attendance);
};

const getDashboardBroadcasts = async (req, res) => {
  const broadcasts = await getBroadcasts();
  res.json(broadcasts);
};

const getDashboard = async (req, res) => {
  const data = await getDashboardData(req.params.id);//changed from req.user.id
  res.json(data);
};

module.exports = { getTeamList, getEmployeeDetails, getEmployeeAttendance, getDashboardBroadcasts,getDashboard };