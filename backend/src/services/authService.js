const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

const registerUser = async (username, email, password, roleId) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    RoleId: roleId, // foreign key
  });

  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email }, include: Role });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  /*const token = jwt.sign(
    { id: user.id, role: user.Role.name },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1d" }
  );

  return { token, user };*/
  return { user }
};

module.exports = { registerUser, loginUser };