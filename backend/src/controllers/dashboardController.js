
const dashboardService = require('../services/dashboardService.js');

const hrDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getHrDashboardData();
    return res.status(200).json(dashboardData);
  } catch (error) {
    if(error.message === 'Error in retrieving broadcasts '){
      return res.status(404).json({ error:404, message: error.message });
    }
    return res.status(500).json({ error:500, message: 'Internal Server Error' });
  }
};


const managerDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getManagerDashboardData(req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error:500,  message :error.message });
  }
};

const employeeDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getEmployeeDashboardData(req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error:500, message: error.message });
  }
};

module.exports = { hrDashboard, managerDashboard, employeeDashboard };