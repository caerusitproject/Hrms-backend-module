const EmployeeService = require("../services/employeeService");

exports.createEmployee = async(req, res) => {
  try {
    console.log(req.body);
    const employee = await EmployeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

 exports.getEmployee = async(req, res) => {
  try {
    const emp = await EmployeeService.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json(emp);
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: err.message });
  }
}

exports.createOffer = async (req, res) => {
  try {
    const emp = await WorkflowService.createOffer(req.body);
    res.status(201).json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadDocs = async (req, res) => {
  try {
    const emp = await WorkflowService.uploadDocs(req.params.id);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyDocs = async (req, res) => {
  try {
    const emp = await WorkflowService.verifyDocs(req.params.id);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.startOnboarding = async (req, res) => {
  try {
    const emp = await WorkflowService.startOnboarding(req.params.id);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.activateEmployee = async (req, res) => {
  try {
    const emp = await WorkflowService.activateEmployee(req.params.id);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.startInduction = async (req, res) => {
  try {
    const emp = await WorkflowService.startInduction(req.params.id);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}
