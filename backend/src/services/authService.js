const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User, Role, RefreshToken,  EmployeeRole,Employee, Department} = require("../models");


//const RefreshTokenDb = require("../models/RefreshToken");
//const JWT_REFRESH_SECRET  = "5cbc66888043682105be8f7d49d1e64d5c898972ad91631cdf15a7f596f903d6";

const registerUser = async (fullname, username, email, password, roleId) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!hashedPassword) { throw new Error("Failed to create hashed password!"); }
  const user = await User.create({
    fullname,
    username,
    email,
    password: hashedPassword,
    roleId: roleId, // foreign key
  });
  if (!user) {
    throw new Error("User registration failed");
  }
  return (user);
};


const loginUser = async (email, password) => {
  const user = await User.findOne({
    where: { email }, include: { model: Role, as: "role" }
  });

  if (!user) throw new Error("Invalid email or password");
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid email or password");


  let authorities = [];
  let role = await Role.findOne({ where: { id: user.roleId } });
  if (role) {
    authorities.push(role.role);
    user.role = role.role //for user role mapping
  }



  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  if (!accessToken || !refreshToken) throw new Error("Failed to generate the access token or refresh token");
  const userData = { id: user.id, email: user.email, username: user.username, authorities }
  return { accessToken, refreshToken, userData }

};


const generateAccessToken = async (user) => {
  console.log(user.role);

  const payload = {
    id: user.id,
    empId: user.empId,
    email: user.email,
    roles: user.role || "USER", // default role
  };
  const accesstoken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

  console.log("data==", accesstoken);
  return accesstoken;
};

const generateRefreshToken = async (user) => {
  const payload = {
    id: user.id,
    empId: user.empId,
    email: user.email,
    roles: user.role || "USER", // default role
  };
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_EXP_REFRESH || "5d",
  });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 5);
  let userId = user.id;
  if (user.empId) {
    const data = await storerefreshToken(token, expiryDate, null, user.empId);
  } else {

    const data = await storerefreshToken(token, expiryDate, userId, null);

  }

  return token;
};

const verifyRefreshToken = async (token) => {
  const tokenStatus = true;
  const storedToken = await RefreshToken.findOne({ where: { token } });
  if (!storedToken) throw new Error("Invalid refresh token");

  if (storedToken.expiryDate < new Date()) {
    await storedToken.destroy();
    tokenStatus = false;

  }
  return tokenStatus;

};

const generateNewrefreshtoken = async (user, rtid) => {
  let userId = user.id;
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return { newAccessToken: accessToken, newRefreshToken: refreshToken }
}

const findUserById = async (userId) => {
  const userData = await User.findOne({ where: { id: userId } });
  if (!userData) throw new Error("User does not exist!");
  return userData;
}

const storerefreshToken = async (token, expiryDate, userId, empId) => {
  const refreshData = await RefreshToken.create({ token, expiryDate, userId, empId });
  if (!refreshData) throw new Error("Error generating refresh token!");
  return refreshData;
}


const findRefreshToken = async (token) => {
  const tokendata = await RefreshToken.findOne({ where: { token } });
  if (!tokendata) return { message: "Couldnot find refresh token" }
  return tokendata;
}


const loginEmployee = async (email, password) => {
  const counte = await Employee.count({
    where: {
      email
    }
  });
  if(counte<1) throw new Error ("NO Employee found with the email ID please check the email and try again");
  if(counte>1) throw new Error ("Unexpected Error occured. More than one employees exist in the database for the email");
  const emp = await Employee.findOne({ where: { email: email } });
  try {
    const { id } = emp.id;
    const employee = await Employee.findOne({
      where: { email: emp.email },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "departmentName"],
        },
        /*{
          model: Role,
          as: "roles",
          attributes: ["id", "name", "role"],
          through: { attributes: [] }, // hides pivot table data (EmployeeRole)
        },*/
      ],
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "designation",
        "joiningDate",
        "status",
      ],
    });

    if (!employee) throw new Error("Employee not found");

    const isMatch = await bcrypt.compare(password, emp.password);

    if (!isMatch) throw new Error("Invalid email or password");
    let authorities = [];

    let rolemap = await EmployeeRole.findOne({ where: { employeeId: emp.id } });
    let role = await Role.findOne({ where: { id: rolemap.roleId } });
    if (rolemap) {
      authorities.push(role.role);
    }
    const user = {}
    user.id = employee.id;
    user.empId = employee.id;
    user.email = employee.email;
    user.role = role.role;
    user.departmentName=employee.department.departmentName;


    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    if (!accessToken || !refreshToken) throw new Error("Failed to generate the access token or refresh token");
    const userData = { id: employee.id, email: employee.email, username: employee.username, authorities , department: user.departmentName}
    return { accessToken, refreshToken: refreshToken, userData }
  } catch (err) {
    console.error("Error fetching employee:", err);
    throw err;
  }

}

const PasswordResetToken = require("../models/PasswordResetToken");
// Generate token and email link
const sendPasswordResetEmail = async (email) => {
  const employee = await Employee.findOne({ where: { email } });
  if (!employee) throw new Error("No account found with that email");

  // Create reset token
  const token = crypto.randomBytes(4).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour expiry

  // Store token
  await PasswordResetToken.create({
    userId: employee.id,
    token,
    expiry
  });

  // Send email
  const resetLink = `${process.env.FRONTEND_URL}/app/reset-password/${token}`;
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: employee.email,
    subject: "Password Reset Request",
    html: `
      <h3>Password Reset</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `,
  });

  return true;
};

const resetUserPassword = async (token, newPassword) => {
  // 1️⃣ Find the reset token
  const resetToken = await PasswordResetToken.findOne({ where: { token } });
  if (!resetToken) throw new Error("Invalid or expired password reset token");

  // 2️⃣ Check expiry
  if (resetToken.expiry < new Date()) throw new Error("Token has expired");

  // 3️⃣ Find the employee using the stored userId
  const employee = await Employee.findByPk(resetToken.userId);
  if (!employee) throw new Error("User not found");

  // 4️⃣ Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 5️⃣ Update password in DB (correct order)
  await Employee.update(
    { password: hashedPassword },
    { where: { id: employee.id } }
  );

  // 6️⃣ Delete used reset token
  await resetToken.destroy();

  return true;
};

module.exports = { registerUser, loginUser, verifyRefreshToken, generateRefreshToken, findUserById, findRefreshToken, generateNewrefreshtoken, loginEmployee , sendPasswordResetEmail, resetUserPassword};