const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employeeController");
const upload = require("../middleware/UploadEmployeeProfileImage");

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management
 */
router.post("/create", ctrl.createEmployee);
router.get("/:id", ctrl.getEmployeeById);
router.put("/edit/:id", ctrl.updateEmployee);
router.get("/all", ctrl.getAllEmployees);
//router.get('/managers', ctrl.getManagers);

router.get('/managers', ctrl.getAllManagers);

// Get manager by ID
router.get('/managers/:id', ctrl.getManagersById);

router.get("/manager/:managerId", ctrl.getSubordinates);
router.patch("/assign-manager", ctrl.assignManager);

//Workflow action endpoint
/*router.post("/", ctrl.createOffer);
router.put("/:id/docs", ctrl.uploadDocs);
router.put("/:id/verify", ctrl.verifyDocs);
router.put("/:id/onboard", ctrl.startOnboarding);
router.put("/:id/activate", ctrl.activateEmployee);
router.put("/:id/induction", ctrl.startInduction);*/

module.exports = router;