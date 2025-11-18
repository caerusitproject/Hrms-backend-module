const EmployeeService = require("../services/employeeService");
const authService = require("../services/authService");



exports.createEmployee = async (req, res) => {
  try {

    if(req.body.name == null || req.body.email == null ) return res.status(400).json({ error:400, message: "Missing required fields."});
    const id= req.user.id;
    const payload=req.body;
    const employee = await EmployeeService.createEmployee(payload, id);  
    return res.status(201).json({ message: "Employee created successfully", employee });
  } catch (err) {
    return res.status(500).json({ error:500, message: "Error "+" "+err });
  }
}

exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email)throw new Error("Email ID required for login please enter email");
    if(!password)throw new Error("Password required for login please enter password");
    const { accessToken, refreshToken, userData } = await authService.loginEmployee(email, password);
    return res.status(200).json({ accessToken, refreshToken, userData });
  } catch (err) {
    return res.status(401).json({ error:401,message: err.message });
  }

}


// Get employees by id
exports.getEmployeeById = async (req, res) => {
  try {
    const emp = await EmployeeService.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error:404, message: 'Not found' });
    return res.status(200).json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:500, message: err.message });
  }
}
// Get all employees with department info
exports.findAllEmployee = async (req, res) => {
  try {
    const employees = await EmployeeService.getAllEmployees();
    return res.status(200).json(employees);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error:400, message: err.message });
  }

};


exports.uploadEmployeeImage = async (req, res) => {//not required functionality already present in upload service
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
      return res.status(404).json({ error:404, message: "Employee not found" });
    }
     
  } catch (err) {
    return res.status(404).json({ error:404, message: err.message });
  }
};


exports.getAllEmployeesPag = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = Number(page);
  limit = Number(limit);

  if (limit < 1 || limit > 100) return res.status(400).json({ error: 400, message: "Limit should be 1-100" });
  if (page < 1) return res.status(400).json({ error: 400, message: "Page must be > 0" });

  try {
    const result = await EmployeeService.getAllEmployeesPag(page, limit);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:500, message: "Failed to fetch employees" });
  }
};


exports.getAllEmployees = async (req, res) => {

  try {
    const result = await EmployeeService.getAllEmployees();
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:500, message: "Failed to fetch employees" });
  }
};

exports.removeEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    await EmployeeService.removeEmployee(employeeId);
    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    return res.status(404).json({ error:404, message: err.message });
  } 
};
    

// Get subordinates for a manager
exports.getSubordinates = async (req, res) => {
  console.log(req.params);
  try {
    const  managerId = req.params.managerId;
    const employees = await EmployeeService.getSubordinates(managerId);
    return res.status(200).json(employees);
  } catch (err) {
    return res.status(500).json({ error:500, message: err.message });
  }
};

// Assign Manager
exports.assignManager = async (req, res) => {
  try {
    const { employeeId, managerId } = req.body;
    const updated = await EmployeeService.assignManager(employeeId, managerId);
    return res.status(200).json({ message: "Manager assigned successfully", updated });
  } catch (err) {
    return res.status(400).json({ error:400,message: err.message });
  }
}
//get manager
exports.getManagersById = async (req, res) => {
  try {
    const managers = await EmployeeService.getManagerById(req.params.id);
    return res.json(managers);
  } catch (err) {
    return res.status(500).json({ error:500, message: err.message });
  }
};
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await EmployeeService.getAllManagers();
    return res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
    });
  } catch (error) {
    return res.status(500).json({
      error: 500,
      message: error.message
    });
  }
};

exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await EmployeeService.getManagerById(id);
    return res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllRoleWiseEmployees = async (req, res) => {
  try {
   
     const { id, roles: role } = req.user;
    const employees = await EmployeeService.getAllRoleWiseEmployees(id, role);  
    return res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    return res.status(500).json({
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
    return res.status(200).json({
      success: true,
      data: managers
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Error fetching managers with employees",
      
    });
  }
};