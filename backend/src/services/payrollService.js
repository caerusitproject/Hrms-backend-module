const Payslip = require('../models/Payslip');
const SalaryStructure = require('../models/SalaryStructure');
const Employee = require('../models/Employee');


async function runPayroll(period, employeeIds = []) {
  // if employeeIds empty -> run for all employees
  const where = employeeIds.length ? { id: employeeIds } : {};
  const employees = await Employee.findAll({ where });

  const results = [];

  for (const emp of employees) {
    // pick latest salary structure for employee (simple approach)
    const structure = await SalaryStructure.findOne({
      where: { employeeId: emp.id },
      order: [['createdAt', 'DESC']]
    });

    const basic = structure?.basic || 0;
    const hra = structure?.hra || 0;
    const allowances = structure?.allowances || 0;
    const deductions = structure?.deductions || 0;

    const gross = Number(basic) + Number(hra) + Number(allowances);
    const totalDeductions = Number(deductions);
    const net = gross - totalDeductions;

    const payslip = await Payslip.create({
      employeeId: emp.id,
      period,
      gross,
      totalDeductions,
      net
    });

    results.push(payslip);
  }

  return results;
}

module.exports = { runPayroll };
