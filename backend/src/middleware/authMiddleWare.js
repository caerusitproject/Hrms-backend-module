const authMiddleware = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
   /* const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token" });*/

    try {
     /* const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
      req.user = decoded;*/

      if (roles.length && !roles.includes("ADMIN")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};

module.exports = authMiddleware;