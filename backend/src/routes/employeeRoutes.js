const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employeeController");
//const upload = require("../middleware/UploadEmployeeProfileImage");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

router.post("/login", ctrl.loginEmployee);

router.post("/create", authenticate, authorizeRoles("HR", "MANAGER","ADMIN"), ctrl.createEmployee);
router.get("/all", authenticate, authorizeRoles("HR", "MANAGER", "ADMIN"), ctrl.getAllEmployees);

router.get('/managers', authenticate, authorizeRoles("HR", "ADMIN"), ctrl.getAllManagers);
// Get manager by ID
router.get('/manager/:id', authenticate, authorizeRoles("HR", "ADMIN"), ctrl.getManagersById);
router.get("/managerSub/:id", authenticate, authorizeRoles("HR", "ADMIN"), ctrl.getSubordinates);
router.patch("/assign-manager", authenticate, authorizeRoles("ADMIN"), ctrl.assignManager);

router.get("/:id", authenticate, authorizeRoles("HR","USER"), ctrl.getEmployeeById);
router.put("/edit/:id", authenticate, authorizeRoles("HR","USER"), ctrl.updateEmployee);

//Workflow action endpoint
/*router.post("/", ctrl.createOffer);
router.put("/:id/docs", ctrl.uploadDocs);
router.put("/:id/verify", ctrl.verifyDocs);
router.put("/:id/onboard", ctrl.startOnboarding);
router.put("/:id/activate", ctrl.activateEmployee);
router.put("/:id/induction", ctrl.startInduction);*/

module.exports = router;