const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");

// Register new user (ADMIN can assign roleId)
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

module.exports = router;