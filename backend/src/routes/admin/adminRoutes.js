const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const emailTemplateController = require('../../controllers/emailTemplateController');
const holidayController= require('../../controllers/holidayController.js')
const { authenticate, authorizeRoles } = require("../../middleware/authMiddleWare");

// All routes restricted to Admins
router.use(authenticate, authorizeRoles("ADMIN"));

// 🔹 Role management
router.post("/roles", adminController.createRole);
router.get("/roles", adminController.getRoles);
router.delete("/roles/:id", adminController.deleteRole);
//Department
router.post("/department", adminController.createDepartment);
//email template creation

//payroll- compensation


//payroll- compensation


//Holiday Routes
router.post("/holiday", holidayController.createHoliday);
router.get("/holiday", holidayController.getHoliday);
router.patch("/holiday", holidayController.updateHoliday);
router.delete("/holiday/:id", holidayController.deleteHoliday);


// 🔹 Employee management
//router.post("/employees", adminController.createEmployee);
//router.put("/employees/:id", adminController.updateEmployee);
//router.delete("/employees/:id", adminController.deleteEmployee);

// 🔹 Assign roles to employee
router.post("/assign-roles", adminController.assignRoles);

module.exports = router;
