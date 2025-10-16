
const dashboardService = require('../services/dashboardService.js');

const hrDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getHrDashboardData();
    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HR dashboard data' });
  }
};


const managerDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getManagerDashboardData(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manager dashboard data' });
  }
};

const employeeDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getEmployeeDashboardData(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee dashboard data' });
  }
};

module.exports = { hrDashboard, managerDashboard, employeeDashboard };