const EmployeeService = require("../services/employeeService");
const authService = require("../services/authService");


exports.registerEmployee = async (req, res) => {
  try {
    const { name, email, password, roleIds } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await Employee.create({ name, email, password: hashedPassword });

    if (roleIds && roleIds.length > 0) {
      await employee.setRoles(roleIds);
    }

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (err) {
    res.status(500).json({ message: "Error creating employee", error: err.message });
  }
};



exports.createEmployee = async (req, res) => {
  try {

      if (!req.body.name || !req.body.email) {
         res.status(400).json({ error: "Missing required fields" });
      } else {

        const employee = await EmployeeService.createEmployee(req.body);
        res.status(201).json({ message: "Employee created successfully", employee });

      }
    
  } catch (err) {
    res.status(400).json({ message: "Error creating employee", error: 400 });
  }
}

exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, userData } = await authService.loginEmployee(email, password);
    res.json({ accessToken, refreshToken, userData });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }



}


// Get employees by id
exports.getEmployeeById = async (req, res) => {
  try {
    const emp = await EmployeeService.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
// Get all employees with department info
exports.findAllEmployee = async (req, res) => {
  try {
    const employees = await EmployeeService.getAllEmployees();
    res.status(200).json(employees);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error:400, message: err.message });
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
     if (updatedEmployee) {
      
      return res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });
    } else {
      return res.status(404).json({ message: "Employee not found" });
    }
     
  } catch (err) {
    res.status(404).json({ error:404, message: err.message });
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


exports.getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    res.json(emp);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

};

exports.removeEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    await EmployeeService.removeEmployee(employeeId);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(404).json({ error:404, message: err.message });
  } 
};
    

// Get subordinates for a manager
exports.getSubordinates = async (req, res) => {
  console.log(req.params);
  try {
    const  managerId = req.params.managerId;
    const employees = await EmployeeService.getSubordinates(managerId);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign Manager
exports.assignManager = async (req, res) => {
  try {
    const { employeeId, managerId } = req.body;
    const updated = await EmployeeService.assignManager(employeeId, managerId);
    res.status(200).json({ message: "Manager assigned successfully", updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
//get manager
exports.getManagersById = async (req, res) => {
  try {
    const managers = await EmployeeService.getManagerById(req.params.id);
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await EmployeeService.getAllManagers();
    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await EmployeeService.getManagerById(id);
    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllRoleWiseEmployees = async (req, res) => {
  try {
   
     const { id, roles: role } = req.user;
    const employees = await EmployeeService.getAllRoleWiseEmployees(id, role);  
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false, 
      message: "Error fetching role-wise employees",
      error: error.message
    });
  }
};



/*exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await EmployeeService.getManagerById(id);
    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};*/


//get all employee by manager
exports.getAllManagersWithEmployees = async (req, res) => {
  try {
    const managers = await EmployeeService.getAllManagersWithEmployees();
    res.status(200).json({
      success: true,
      data: managers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching managers with employees",
      error: error.message
    });
  }
};