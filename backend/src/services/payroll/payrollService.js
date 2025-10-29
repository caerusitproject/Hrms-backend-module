const Compensation = require('../../models/payroll/compensation');
const Payroll = require('../../models/payroll/payroll');
const PayrollLineItem  = require('../../models/payroll/payrollLineItem');
const Employee = require('../../models/Employee');
const generatePDF = require('../../util/payslipGenerator')
const {sendPayslipEmail} = require('../../services/notification/notificationHandler');

exports.generatePayroll = async (month, year) => {//cerates the payroll and stores it into the payrolllineitem and pyroll table
  const employees = await Employee.findAll({ include: [Compensation] });

  if (employees.length === 0) throw new Error('No employees found');

  const payrolls = [];

  for (const emp of employees) {
    const comp = emp.Compensation;
    if (!comp) continue;

    const totalEarnings = comp.baseSalary + comp.hra + comp.allowances;
    const totalDeductions = comp.deductions;
    const netPay = totalEarnings - totalDeductions;

    const payroll = await Payroll.create({
      employeeId: emp.id,
      month,
      year,
      totalEarnings,
      totalDeductions,
      netPay,
    });

    await PayrollLineItem.bulkCreate([
      { payrollId: payroll.id, description: 'Base Salary', type: 'EARNING', amount: comp.baseSalary },
      { payrollId: payroll.id, description: 'HRA', type: 'EARNING', amount: comp.hra },
      { payrollId: payroll.id, description: 'Allowances', type: 'EARNING', amount: comp.allowances },
      { payrollId: payroll.id, description: 'Deductions', type: 'DEDUCTION', amount: comp.deductions },
    ]);

    payrolls.push(payroll);
  }

  return payrolls;
};

exports.processPayroll = async (payrollId) => {
  const payroll = await Payroll.findByPk(payrollId, { include: Employee });
  if (!payroll) throw new Error('Payroll not found');

  const employee = payroll.Employee;

  // Generate PDF
  const pdfPath = await generatePDF.generatePayslipPDF(employee , payroll)

   // ---- SEND PAYSLIP EMAIL ----
    await sendPayslipEmail(employee, pdfPath);

  return { message: 'Payslip generated and emailed successfully', pdfPath };
};

exports.finalizePayrollForMonth = async (month , year) => {
/**
 * Finalize payroll for all employees
 */

  
  const employees = await Employee.findAll({ include: Compensation });
  if (!employees || employees.length === 0) throw new Error('No employees found');

  const results = [];

  for (const emp of employees) {
    const payLoad = await this.processSalary(emp, month, year);
    if(payLoad){
      var payroll ={
        employeeId: payLoad.employeeId,
        month : payLoad.month,
        year: payLoad.year,
      basicSalary :payLoad.basicSalary,       
      deductions: payLoad.totalDeductions,
      grossSalary: payLoad.grossSalary,
      netSalary : payLoad.netSalary,
      status: 'GENERATED'

      }
      await this.createOrUpdatePayroll(emp.id, month , year, payLoad);
    }
    //const payroll = await this.createOrUpdatePayroll(emp.id, month , year, payLoad);
    // ---- GENERATE PAYSLIP PDF ----
    const pdfPath = await generatePDF.generatePayslip(emp , payLoad)

    // ---- SEND PAYSLIP EMAIL ----
    await sendPayslipEmail(emp, pdfPath);

    results.push({
      employee: emp.name,
      email: emp.email,
      netSalary:payLoad.netSalary,
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


exports.processSalary = async (emp, month, year) =>{
    var payload ={};
  try{

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
      basicSalary ,
      hra ,
      da,
      conveyance,
      bonus,
      pf,
      esi,
      tax,      
      deductions: totalDeductions,
      grossSalary: grossSalary,
      netSalary : netSalary,
      status: 'Created'
    }
  }

  }catch(err){
    console.error('[PayrollService] Error:', err);
    throw err;
  }

  return payload;

};
