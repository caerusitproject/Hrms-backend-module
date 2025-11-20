const Compensation = require('../../models/payroll/compensation');
const Employee = require('../../models/Employee');
const { where } = require('sequelize');
const { Op } = require('sequelize');

exports.createOrUpdateCompensation = async (employeeId, data) => {
  const emp = await Employee.findByPk(employeeId);
  if (!emp) throw new Error('Employee not found');
  const allowedFields = [
    'baseSalary', 'bonus', 'incentives', 'overtimePay', 'commission',
    'allowances', 'hra', 'da', 'lta', 'medicalAllowance', 'pf', 'esi',
    'gratuity', 'professionalTax', 'incomeTax', 'deductions', 'remarks', 'netSalary', 'totalDeductions', 'totalEarnings'//added
  ];
  const filteredData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      if(key !== 'remarks'){filteredData[key] = parseFloat(data[key],0.00);}
      else{filteredData[key] = data[key];}
    }
  }
  const isPartial = Object.keys(filteredData).length <= 2;
  if (isPartial) {
    const baseSalary = data.baseSalary || 0;
    const defaults = {
      bonus: baseSalary * 0.05,
      incentives: baseSalary * 0.02,
      overtimePay: baseSalary * 0.01,
      commission: baseSalary * 0.005,
      allowances: baseSalary * 0.05,
      hra: baseSalary * 0.20,
      da: baseSalary * 0.10,
      lta: baseSalary * 0.04,
      medicalAllowance: baseSalary * 0.02,
      pf: baseSalary * 0.12,
      esi: baseSalary * 0.0175,
      gratuity: baseSalary * 0.0481,
      professionalTax: baseSalary * 0.01,
      incomeTax: baseSalary * 0.06,
      deductions: baseSalary * 0.02,
      totalEarnings: parseInt(baseSalary +bonus+incentives+overtimePay+commission+allowances+hra+da+lta+medicalAllowance),
      totalDeductions: parseInt(pf+esi+gratuity+professionalTax+incomeTax+deductions),
      netSalary:totalEarnings-totalDeductions,
      remarks: 'Auto-generated compensation structure'
    };
    for (const key of Object.keys(defaults)) {
      if (filteredData[key] === undefined) {
        filteredData[key] = key === 'remarks'
          ? defaults[key]
          : Math.round(defaults[key]);
      }
    }
  }
  let compensation = await Compensation.findOne({ where: { employeeId } });

  if (compensation) {
    await compensation.update(filteredData, {
      where: { id: compensation.id }
    });

    return { message: 'Compensation updated successfully', compensation };
  } else {
    compensation = await Compensation.create({ employeeId, ...filteredData });
    return { message: 'Compensation created successfully', compensation };
  }
};


exports.getCompensationByEmployee = async (employeeId) => {
  return Compensation.findOne({ where: { employeeId } });
};

exports.getAllCompensations = async () => {
  return Compensation.findAll({ include: Employee });
};
exports.getEmployeeList = async () => {//done by tks
  return Employee.findAll({
    where: {
      status: 'Active',
      id: {
        [Op.notIn]: await Compensation.findAll({ attributes: ['employeeId'] }).then(records => records.map(record => record.employeeId))
      }
    },
    attributes: ['id', 'name', 'email', 'departmentId', 'designation', 'empCode']
  });
};

exports.deleteCompensation = async (id) => {
  const deleted = await Compensation.destroy({ where: { id } });
  if (!deleted) throw new Error('Compensation not found');
  return { message: 'Compensation deleted successfully' };
};
