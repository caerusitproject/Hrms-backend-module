const { registerUser, loginUser } = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;
    const user = await registerUser(username, email, password, roleId);
    res.json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
