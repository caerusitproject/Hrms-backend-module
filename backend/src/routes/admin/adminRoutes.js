const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleWare");

/*router.get("/dashboard", authMiddleware("ADMIN"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});*/

//module.exports = router;