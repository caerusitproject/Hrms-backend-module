const payrollService = require('../../services/payroll/payrollService');

/**
 * @desc  Finalize payroll for all employees for a given month
 * @route POST /api/payroll/finalize
 * @access Admin
 */
exports.finalizePayroll = async (req, res) => {
  try {
    //const { month } = req.body;
    var monthyear = req.body.monthyear;
    const [month, year] = monthyear.split('-').map(Number);;
    if (!month) {
      return res.status(400).json({ message: 'Month (YYYY-MM) is required' });
    }

    console.log(`[PayrollController] Finalizing payroll for ${month}`);

    const result = await payrollService.finalizePayrollForMonth(month, year);

    res.status(200).json({
      status: 'success',
      message: `Payroll finalized for ${month}`,
      summary: {
        processedEmployees: result.processed,
      },
      details: result.employees
    });
  } catch (error) {
    console.error('[PayrollController] Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc  Generate payroll for a single employee (Admin manual trigger)
 * @route POST /api/payroll/generate
 * @access Admin
 */
exports.generatePayrollForEmployee = async (req, res) => {
  try {
    const { employeeId, month } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ message: 'Employee ID and month are required' });
    }

    const payroll = await payrollService.generatePayrollForEmployee(employeeId, month);

    res.status(201).json({
      status: 'success',
      message: `Payroll generated for employee ID ${employeeId} (${month})`,
      data: payroll
    });
  } catch (error) {
    console.error('[PayrollController] Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc  Fetch all payroll records
 * @route GET /api/payroll
 * @access Admin
 */
exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await payrollService.getAllPayrolls();
    res.status(200).json({
      status: 'success',
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error('[PayrollController] Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc  Get payroll details for one employee
 * @route GET /api/payroll/:employeeId/:month
 * @access Admin
 */
exports.getPayrollByEmployee = async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    const payroll = await payrollService.getPayrollByEmployee(employeeId, month);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.status(200).json({
      status: 'success',
      data: payroll
    });
  } catch (error) {
    console.error('[PayrollController] Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
