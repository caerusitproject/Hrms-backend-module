const Compensation = require('../../models/payroll/compensation');
const Payroll = require('../../models/payroll/payroll');
const { Op } = require('sequelize');
const Employee = require('../../models/Employee');
const generatePDF = require('../../util/payslipGenerator')
const { sendPayslipEmail } = require('../../services/notification/notificationHandler');
const { where } = require('sequelize');

const  payrollWorkflow = require('../workflow/payrollWorkflow');


exports.processPayroll = async (payrollIds) => {
  if (!Array.isArray(payrollIds) || payrollIds.length === 0) {
    throw new Error('payrollIds must be a non-empty array');
  }

  const results = [];
  const errors = [];

  for (const payrollId of payrollIds) {
    try {
      
      const payroll = await Payroll.findByPk(payrollId, {
        include: [
          {
            model: Employee,
            include: [Compensation],
            required: true
          }
        ]
      });

      if (!payroll) {
        errors.push({ payrollId, error: 'Payroll not found' });
        continue;
      }

      const employee = payroll.employee;
      if (!employee) {
        errors.push({ payrollId, error: 'Employee not found' });
        continue;
      }

      const month = payroll.month;
      const year = payroll.year;

      
      const payLoad = await this.processSalary(employee, month, year);
      if (!payLoad) {
        errors.push({ payrollId, error: 'Salary processing failed' });
        continue;
      }

      
      await this.createOrUpdatePayroll(employee.id, month, year, payLoad);

      
      const pdfPath = await generatePDF.generatePayslip(employee, payLoad);

      //workflow update to PAYSLIP_GENERATED
      await payrollWorkflow.initiatePayroll({
        refId: payroll.id,
        employeeId: employee.id,
        initiatedBy: 1, //system user
        month: payroll.month,
        year: payroll.year
      });

      
      await sendPayslipEmail(employee, pdfPath);

      results.push({
        payrollId,
        employeeId: employee.id,
        employeeName: employee.name || `${employee.firstName} ${employee.lastName}`,
        status: 'success',
        message: 'Payslip generated and emailed',
        pdfPath,
        netSalary: payLoad.netSalary
      });

    } catch (error) {
      console.error(`[PayrollService] Error processing payroll ID ${payrollId}:`, error);
      errors.push({
        payrollId,
        error: error.message
      });
    }
  }

  return {
    message: `Processed ${results.length} payroll(s)`,
    totalProcessed: payrollIds.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
};


exports.finalizePayrollForMonth = async (month, year) => {
  /**
   * Finalize payroll for all employees
   */

  const employees = await Employee.findAll({
    include: [
      {
        model: Compensation,
        required: true
      }
    ]
  });
  if (!employees || employees.length === 0) throw new Error('No employees found');

  const results = [];

  for (const emp of employees) {
    const payLoad = await this.processSalary(emp, month, year);
    if (payLoad) {
      var payroll = {
        employeeId: payLoad.employeeId,
        month: payLoad.month,
        year: payLoad.year,
        basicSalary: payLoad.basicSalary,
        deductions: payLoad.totalDeductions,
        grossSalary: payLoad.grossSalary,
        netSalary: payLoad.netSalary,
        status: 'NOT CREATED'

      }
      await this.createOrUpdatePayroll(emp.id, month, year, payLoad);
    }
    
    // ---- GENERATE PAYSLIP PDF ----
    const pdfPath = await generatePDF.generatePayslip(emp , payLoad)
    

    // ---- SEND PAYSLIP EMAIL ----
    await sendPayslipEmail(emp, pdfPath);

    results.push({
      employee: emp.name,
      email: emp.email,
      netSalary: payLoad.netSalary,
      pdfPath
    });
  }

  return {
    message: `Payroll finalized for ${month}`,
    processed: results.length,
    employees: results
  };
};


exports.createOrUpdatePayroll = async (employeeId, month, year, payrollData) => {
  try {
    // Check if payroll exists
    let payroll = await Payroll.findOne({
      where: { employeeId, month, year },
    });

    if (payroll) {
      // ✅ Update existing payroll
      await payroll.update(payrollData);
      console.log(`[PayrollService] Updated payroll for ${employeeId} (${month}-${year})`);
    } else {
      // ✅ Create new payroll
      payroll = await Payroll.create({
        employeeId,
        month,
        year,
        ...payrollData,
      });
      console.log(`[PayrollService] Created new payroll for ${employeeId} (${month}-${year})`);
    }

    // Optionally, sync compensation data
    const compensation = await Compensation.findOne({ where: { employeeId } });
    if (compensation) {
      const grossSalary =
        (Number(compensation.basicSalary || 0) +
          Number(compensation.hra || 0) +
          Number(compensation.allowance || 0) +
          Number(compensation.bonus || 0)) || 0;

      const totalDeductions =
        (Number(compensation.tax || 0) +
          Number(compensation.pf || 0) +
          Number(compensation.insurance || 0)) || 0;

      const netSalary = grossSalary - totalDeductions;

      await payroll.update({
        grossSalary,
        netSalary,
      });
    }

    return payroll;
  } catch (err) {
    console.error('[PayrollService] Error:', err);
    throw err;
  }
};


exports.processSalary = async (emp, month, year) => {
  var payload = {};
  try {

    const comp = emp.Compensation;
    if (comp) {

      // ---- SALARY BREAKUP CALCULATION ----
      const basicSalary = comp.baseSalary || 0;
      const hra = comp.hra || (basicSalary * 0.4);
      const da = comp.da || (basicSalary * 0.1);
      const conveyance = comp.conveyance || 1600;
      const bonus = comp.bonus || 0;

      const grossSalary = basicSalary + hra + da + conveyance + bonus;

      const pf = comp.pf || (basicSalary * 0.12);
      const esi = comp.esi || (grossSalary * 0.0075);
      const tax = comp.tax || (grossSalary * 0.1);
      const otherDeductions = comp.otherDeductions || 0;

      const totalDeductions = pf + esi + tax + otherDeductions;
      const netSalary = grossSalary - totalDeductions;

      // ---- CREATE PAYROLL RECORD ----
      payload = {
        employeeId: emp.id,
        month,
        year,
        basicSalary,
        hra,
        da,
        conveyance,
        bonus,
        pf,
        esi,
        tax,
        deductions: totalDeductions,
        grossSalary: grossSalary,
        netSalary: netSalary,
        status: 'Created'
      }
    }

  } catch (err) {
    console.error('[PayrollService] Error:', err);
    throw err;
  }

  return payload;

};

exports.getNotGenerated = async () => {
  const notGenerated = await Payroll.findAll({
    where: { status: 'NOT CREATED' },
    attributes: ['id', 'employeeId', 'month', 'year', 'deductions', 'netSalary', 'status', 'grossSalary']
  });
  if (!notGenerated) { throw new Error("Error while retrieving the Not generated list") };
  return notGenerated;
}

exports.getCreated = async () => {
  const created = await Payroll.findAll({
    where: { status: 'Created' },
    attributes: ['id', 'employeeId', 'month', 'year', 'deductions', 'netSalary', 'status', 'grossSalary']
  });
  if (!created) { throw new Error("Error while retrieving the created payslip list") };
  return created;
}

exports.getFilteredPayrolls = async (monthType, status) => {
  try {
    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Determine which month/year to use
    let filterMonth = currentMonth;
    let filterYear = currentYear;

    if (monthType.toLowerCase() === 'previous') {
      filterMonth = currentMonth - 1;
      if (filterMonth === 0) {
        filterMonth = 12;
        filterYear = currentYear - 1;
      }
    }
    filterMonth = filterMonth < 10 ? '0' + filterMonth.toString() : filterMonth.toString();
    filterYear = filterYear.toString();
    const payrolls = await Payroll.findAll({
      where: {
        [Op.and]: [
          { status },
          { month: filterMonth },
          { year: filterYear },
        ],
      },
      attributes: [
        'id',
        'employeeId',
        'month',
        'year',
        'deductions',
        'netSalary',
        'grossSalary',
        'status',
      ],
    });

    return payrolls;
  } catch (error) {
    console.error("Error while filtering payrolls:", error);
    throw new Error("Failed to fetch filtered payrolls");
  }
};

exports.getAllPayrolls = async () => {
  try {
    const payrolls = await Payroll.findAll({
      attributes: [
        "id",
        "employeeId",
        "basicSalary",
        "bonus",
        "deductions",
        "netSalary",
        "month",
        "year",
        "createdAt"
      ],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email", "designation"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["id", "name"]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return payrolls;
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    throw new Error("Unable to fetch payroll records");
  }
};

exports.getPayrollByEmployee = async (employeeId, month = null) => {
  try {
    if (!employeeId) {
      throw new Error("Employee ID is required.");
    }

    // ✅ Base query filter
    const whereClause = { employeeId };
    if (month) whereClause.month = month;

    // ✅ Query with associations
    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email", "designation"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["id", "name"]
            }
          ]
        }
      ],
      attributes: [
        "id",
        "employeeId",
        "month",
        "year",
        "basicSalary",
        "bonus",
        "deductions",
        "netSalary",
        "createdAt"
      ],
      order: [["year", "DESC"], ["month", "DESC"]]
    });

    if (!payrolls || payrolls.length === 0) {
      return { message: "No payroll records found for this employee." };
    }

    return payrolls;
  } catch (error) {
    console.error("❌ Error in getPayrollByEmployee:", error.message);
    throw error;
  }
};