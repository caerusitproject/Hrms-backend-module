const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const authMiddleware = require("../middleware/authMiddleWare")

// Only ADMIN can create new roles
router.post("/",authMiddleware.authenticate, authMiddleware.authorizeRoles("ADMIN"),  roleController.addRole);

// All logged-in users can view roles
router.get("/",authMiddleware.authenticate, authMiddleware.authorizeRoles("ADMIN","USER","HR","MANAGER"), roleController.listRoles);

module.exports = router;