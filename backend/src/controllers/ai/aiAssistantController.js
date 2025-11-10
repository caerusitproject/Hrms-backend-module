// src/controllers/aiAssistantController.js
const aiService = require("../../services/ai/aiAssistantService");
const empService = require("../../services/employeeService")

exports.chatWithAI = async (req, res) => {
       
  try {
    const { query } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No access token provided.');
    }

    const { employee, roles } = await empService.getEmployeeFromToken(authHeader);
    const userId = employee?.id || null; // if authenticated

    const context = { employeeName: employee?.name, role: employee.roles[0].role };
    const answer = await aiService.askAI(query, userId, context);
    //askAI(query, context, userId);

    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}