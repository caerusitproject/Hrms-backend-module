const payrollService = require('../services/payrollService');

async function runPayroll(req, res) {
  try {
    const { period, employeeIds } = req.body; // period 'YYYY-MM', employeeIds optional
    if (!period) return res.status(400).json({ error: 'period is required' });
    const results = await payrollService.runPayroll(period, employeeIds || []);
    return res.json({ count: results.length, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { runPayroll };
