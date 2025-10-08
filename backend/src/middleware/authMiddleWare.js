const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // { id, roleId }
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.roleId !== 1) return res.status(403).json({ message: "Forbidden" });
  next();
};
