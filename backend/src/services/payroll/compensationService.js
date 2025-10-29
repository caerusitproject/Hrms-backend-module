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
    'gratuity', 'professionalTax', 'incomeTax', 'deductions', 'remarks'
  ];

  const filteredData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) filteredData[key] = data[key];
  }

  const existing = await Compensation.findOne({ where: { employeeId } });

  if (existing) {
    await existing.update(filteredData);
    return { message: 'Compensation updated successfully', compensation: existing };
  }

  const comp = await Compensation.create({ employeeId, ...filteredData });
  return { message: 'Compensation created successfully', compensation: comp };
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
