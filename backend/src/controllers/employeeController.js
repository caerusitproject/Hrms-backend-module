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

 exports.getEmployeeById = async(req, res) => {
  try {
    const emp = await EmployeeService.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json(emp);
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: err.message });
  }
}

exports.findAllEmployee = (req, res) => {

};

exports.uploadEmployeeImage = async (req, res) => {
  try {
    const employeeId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const updatedEmployee = await EmployeeService.uploadEmployeeImage(
      employeeId,
      req.file.path
    );

    res.status(200).json({ message: "Image uploaded successfully", employee: updatedEmployee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedEmployee = await EmployeeService.updateEmployee(employeeId, req.body);
    res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



//hr action part
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
