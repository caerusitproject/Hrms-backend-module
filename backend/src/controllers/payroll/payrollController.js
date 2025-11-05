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
    if (!monthyear) {
      return res.status(400).json({ message: 'Month (MM-YYYY) is required' });
    }
    const [month, year] = monthyear?.split('-');

    const result = await payrollService.finalizePayrollForMonth(month, year);

    res.status(200).json({
      status: 'success',
      message: `Payroll finalized for ${month}-${year}`,
      summary: {
        processedEmployees: result.processed,
      },
      details: result.employees
    });
  } catch (error) {
     res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc  Generate payroll for a single employee (Admin manual trigger)
 * @route POST /api/payroll/generate
 * @access Admin
 */
/*exports.generatePayrollForEmployee = async (req, res) => {
  try {
    const { employeeId, month } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ message: 'Employee ID and month are required' });
    }
    const payroll = await payrollService.processPayroll(employeeId, month);
    res.status(201).json({
      status: 'success',
      message: `Payroll generated for employee ID ${employeeId} (${month})`,
      data: payroll
    });
  } catch (error) {
    console.error('[PayrollController] Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};*/

exports.generatePayrollForEmployee = async (req, res) => {
  try {
    const { payrollIds } = req.body;
    if (!payrollIds) {
      return res.status(400).json({ message: 'payrollIds are required. Please enter valid data' });
    }
    if (payrollIds && !Array.isArray(payrollIds)) {
      return res.status(400).json({ message: 'payrollIds must be an array' });
    }
    const payroll = await payrollService.processPayroll( payrollIds);
    res.status(201).json({
      status: 'success',
      message: `SalarySlip generated against the payroll IDS`,
      data: payroll
    });
  } catch (error) {
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
     res.status(500).json({ status: 'error', message: error.message });
  }
};
exports.getNotGenerated = async (req,res)=> {
   try{
      const notGenerated= await payrollService.getNotGenerated();
      if(!notGenerated|| notGenerated.length===0){ return res.status(200).json({message: 'No Pending emplyee payroll slip found!'}) }
      res.status(200).json({
        status: 'success',
        data:notGenerated
      });
   }catch(error){
      res.satus(500).json({ error:500, message: error.message })
  }
};

exports.getCreated = async (req,res)=> {
   try{
      const created= await payrollService.getCreated();
      if(!created|| created.length===0){ return res.status(200).json({message: 'No created employee slip found!'}) }
      res.status(200).json({
        status: 'success',
        data:created
      });
   }catch(error){
      res.satus(500).json({ error:500, message: error.message })
  }
};

exports.getFilteredPayrolls = async (req, res) => {
  try {
    const { monthType, status } = req.query;
    if (!monthType || !status) {
      return res.status(400).json({
        message: "Please provide both 'monthType' (current/previous) and 'status' (Created/NOT CREATED)",
      });
    }

    const filteredPayrolls = await payrollService.getFilteredPayrolls(monthType, status);

    if (!filteredPayrolls || filteredPayrolls.length === 0) {
      return res.status(200).json({
        message: `No payrolls found for ${monthType} month with status ${status}.`,
      });
    }

    res.status(200).json({
      status: "success",
      count: filteredPayrolls.length,
      data: filteredPayrolls,
    });
  } catch (error) {
    
    res.status(500).json({ error: 500, message: error.message });
  }
};