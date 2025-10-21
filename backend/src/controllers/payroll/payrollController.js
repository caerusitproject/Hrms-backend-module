const payrollService = require('../../services/payroll/payrollService');

/*exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const payrolls = await payrollService.generatePayroll(month, year);
    res.status(200).json({ message: 'Payroll generated successfully', data: payrolls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};*/

/*exports.finalizePay = async (req, res) => {
  try{

    const { month } = req.body;
    if (!month) return res.status(400).json({ error: 'Month (YYYY-MM) is required' });

    const result = await payrollService.finalizePayrollForMonth(month);
    res.status(200).json(result);

  }catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }


};*/

/**
 * @desc  Finalize payroll for all employees for a given month
 * @route POST /api/payroll/finalize
 * @access Admin
 */
exports.finalizePayroll = async (req, res) => {
  try {
    const { monthyear } = req.body;
    const parts = monthyear.split('-');
    let month = "";
    let  year = "";
    if (!monthyear) {
      return res.status(400).json({ message: 'Month (YYYY-MM) is required' });
    }

    if(monthyear.length > 2){
      
     month = parseInt(parts[0], 10); // Converts "10" to the number 10
     year = parseInt(parts[1], 10);
    }

    console.log(`[PayrollController] Finalizing payroll for ${month} - ${year}`);

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