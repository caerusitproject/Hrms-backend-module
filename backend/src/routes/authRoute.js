
const authController = require('../controllers/authcontroller')
const express = require("express");
const router = express.Router();

// Register new user (ADMIN can assign roleId)
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

//employee
//router.post("/emplogin", authController.login);

router.post("/refresh", authController.refresh);

// Forgot / Reset Password
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
module.exports = router;