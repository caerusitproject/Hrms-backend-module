const compensationService = require('../../services/payroll/compensationService');
exports.createOrUpdateCompensation = async (req, res) => {//will also be used as update the compensation which will indeed be needed for appraisals.
  try {
    const { employeeId, ...data } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const result = await compensationService.createOrUpdateCompensation(employeeId, data);
    res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

exports.getCompensationByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const comp = await compensationService.getCompensationByEmployee(employeeId);
    if (!comp) return res.status(404).json({ message: 'Compensation not found' });
    res.status(200).json(comp);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

exports.getAllCompensations = async (req, res) => {
  try {
    const comps = await compensationService.getAllCompensations();
    res.status(200).json(comps);
  } catch (error) {
        res.status(500).json({ error: error.message });
  }
};
exports.getEmployeeList = async (req, res) => {
  try {
    const employees = await compensationService.getEmployeeList();
    res.status(200).json(employees);
  } catch (error) {
        res.status(500).json({ error: error.message });
  }                       
};

exports.deleteCompensation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await compensationService.deleteCompensation(id);
    res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};