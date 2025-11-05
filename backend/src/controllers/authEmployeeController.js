const EmployeeService = require("../services/employeeService");

exports.register = async (req, res) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    return res.status(201).json({ message: "Employee registered successfully", employee });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(400).json({ error:400, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await EmployeeService.login(email, password);
    return res.json({ message: "Login successful", ...result });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({ error:401, message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await EmployeeService.refreshAccessToken(refreshToken);
    return res.status(201).json(tokens);
  } catch (error) {
    return res.status(403).json({error:403, message: error.message });
  }
};