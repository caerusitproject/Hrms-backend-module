const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employeeController");
//const upload = require("../middleware/UploadEmployeeProfileImage");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");



router.post("/create", authenticate, authorizeRoles("HR","MANAGER"),ctrl.createEmployee);
router.get("/:id", authenticate, authorizeRoles("USER"),ctrl.getEmployeeById);
router.put("/edit/:id",authenticate, authorizeRoles("USER"), ctrl.updateEmployee);
router.get("/all",authenticate, authorizeRoles("HR","MANAGER"),ctrl.getAllEmployees);
router.get('/managers', authenticate, authorizeRoles("HR","ADMIN"), ctrl.getAllManagers);
// Get manager by ID
router.get('/managers/:id', authenticate, authorizeRoles("HR","ADMIN"), ctrl.getManagersById);
router.get("/manager/:managerId", authenticate, authorizeRoles("HR","ADMIN"), ctrl.getSubordinates);
router.patch("/assign-manager", authenticate, authorizeRoles("ADMIN"),ctrl.assignManager);

//Workflow action endpoint
/*router.post("/", ctrl.createOffer);
router.put("/:id/docs", ctrl.uploadDocs);
router.put("/:id/verify", ctrl.verifyDocs);
router.put("/:id/onboard", ctrl.startOnboarding);
router.put("/:id/activate", ctrl.activateEmployee);
router.put("/:id/induction", ctrl.startInduction);*/

module.exports = router;