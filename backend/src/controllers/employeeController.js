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
// Get employees by id
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
// Get all employees with department info
exports.findAllEmployee = async(req, res) => {
  try{
    const employees = await EmployeeService.getAllEmployees();
    res.status(200).json(employees);
  }catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }

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

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeService.getAllEmployees();
    res.status(200).json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
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

};

// Get subordinates for a manager
exports.getSubordinates = async (req, res) => {
  try {
    const { managerId } = req.params;
    const employees = await employeeService.getSubordinates(managerId);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign Manager
exports.assignManager = async (req, res) => {
  try {
    const { employeeId, managerId } = req.body;
    const updated = await employeeService.assignManager(employeeId, managerId);
    res.status(200).json({ message: "Manager assigned successfully", updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}