const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role, RefreshToken } = require("../models");
const RefreshTokenDb = require("../models/RefreshToken");
const JWT_REFRESH_SECRET  = "5cbc66888043682105be8f7d49d1e64d5c898972ad91631cdf15a7f596f903d6";

const registerUser = async (fullname,username, email, password, roleId) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullname,
    username,
    email,
    password: hashedPassword,
    roleId: roleId, // foreign key
  });
  return (user);
};


const loginUser = async (email, password) => {
    const user = await User.findOne({
      where: { email }, include: { model: Role, as: "role" }});

    if (!user) throw new Error("Invalid email or password");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error("Invalid email or password");
    

      let authorities = [];
      let role = await Role.findOne({ where: { id : user.roleId}});
      if(role){
          authorities.push(role.role.toUpperCase());
      }
    
      

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    const userData = {id:user.id, email: user.email,username: user.username, authorities}
  return {accessToken , refreshToken , userData}

};


const generateAccessToken = async (user) => {
console.log(user.role.role);
  const payload = {
    id: user.id,
    email: user.email,
    roles: user.role.role || ["USER"], // default role
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
    email: user.email,
    roles: user.roles || ["USER"], // default role
  };
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_EXP_REFRESH || "5d",
  });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 5);
  let userId = user.id;
 
  const data = await storerefreshToken( token, expiryDate, userId );
 
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

  return {newAccessToken : accessToken, newRefreshToken : refreshToken}
}

const findUserById = async (userId) => {
  const userData = await User.findOne({where: {id: userId}});
  return userData;
}

const storerefreshToken = async (token, expiryDate, userId) => {
  const refreshData = await RefreshToken.create({token, expiryDate, userId });
  return refreshData;
}


const findRefreshToken = async(token) =>{
  const tokendata = await RefreshToken.findOne({ where: { token } });
  return tokendata;
}
module.exports = { registerUser, loginUser, verifyRefreshToken, generateRefreshToken, findUserById ,findRefreshToken,generateNewrefreshtoken};