const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employeeController");
//const upload = require("../middleware/UploadEmployeeProfileImage");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

router.post("/login", ctrl.loginEmployee);

router.post("/create", authenticate, authorizeRoles("HR", "MANAGER","ADMIN"), ctrl.createEmployee);
router.patch("/delete/:id", authenticate, authorizeRoles("HR","ADMIN"), ctrl.removeEmployee);//will go into hr routes
router.get("/all", authenticate, authorizeRoles("HR", "MANAGER", "ADMIN"), ctrl.getAllEmployees);
router.get("/list", authenticate, authorizeRoles("HR", "MANAGER", "ADMIN"), ctrl.getAllRoleWiseEmployees);
router.get('/managers', authenticate, authorizeRoles("HR", "ADMIN"), ctrl.getAllManagers);
// Get manager by ID
router.get('/manager/:id', authenticate, authorizeRoles("HR", "ADMIN"), ctrl.getManagersById);
router.get("/managers/subordinate/:managerId", authenticate, authorizeRoles("HR", "ADMIN"), ctrl.getSubordinates);
router.patch("/assign/manager", authenticate, authorizeRoles("ADMIN","HR"), ctrl.assignManager);//will go into hr routes

router.get("/:id", authenticate, authorizeRoles("HR","USER","ADMIN","MANAGER"), ctrl.getEmployeeById);
router.put("/edit/:id", authenticate, authorizeRoles("HR","USER"), ctrl.updateEmployee);//will go into hr routes

router.get('/managers/subordinate',authenticate, authorizeRoles("HR","ADMIN"),ctrl.getAllManagersWithEmployees);//will go into hr routes

//Workflow action endpoint
/*router.post("/", ctrl.createOffer);
router.put("/:id/docs", ctrl.uploadDocs);
router.put("/:id/verify", ctrl.verifyDocs);
router.put("/:id/onboard", ctrl.startOnboarding);
router.put("/:id/activate", ctrl.activateEmployee);
router.put("/:id/induction", ctrl.startInduction);*/

module.exports = router;