const { getTeam, getEmployeeProfile, getAttendance, getBroadcasts } = require('../services/managerService.js');

const getTeamList = async (req, res) => {
  const team = await getTeam(req.user.id);
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

module.exports = { getTeamList, getEmployeeDetails, getEmployeeAttendance, getDashboardBroadcasts };