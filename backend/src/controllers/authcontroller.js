const authservice = require("../services/authService");
const empService = require("../services/employeeService");


const register = async (req, res) => {
  try {
    const { fullname, username, email, password, roleId } = req.body;
    const user = await authservice.registerUser(fullname, username, email, password, roleId);
    return res.json({ message: "User registered successfully", user });
  } catch (err) {
    return res.status(400).json({ error:400, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, userData } = await authservice.loginUser(email, password);
    return res.status(201).json({ accessToken, refreshToken, userData });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({message: "Refresh token required" });

    const status = await authservice.verifyRefreshToken(refreshToken);
    if (!status) {
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    } else {

      const tokendata = await authservice.findRefreshToken(refreshToken);
      let id = tokendata.id;
      var userinfo = {};
      if (tokendata.empId) {
        userdata = await empService.getEmployeeById(tokendata.empId);
        userinfo = {
          id: userdata.id,
          empId: userdata.id,
          email: userdata.email,
          role: userdata.roles[0].role
        }
      } else {
        userinfo = await authservice.findUserById(tokendata.userId);
      }
      const { newAccessToken, newRefreshToken } = await authservice.generateNewrefreshtoken(userinfo, id);

      return res.status(201).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    }

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authservice.sendPasswordResetEmail(email);
    return res.status(200).json({ message: "Password reset email sent successfully!" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    await authservice.resetUserPassword(token, password);
    return res.status(200).json({ message: "Password has been reset successfully!" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};


module.exports = { register, login, refresh, forgotPassword , resetPassword }
