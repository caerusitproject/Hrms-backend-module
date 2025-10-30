const express = require('express');
const controllerAction = require('../controllers/managerController.js');
const ctrl = require("../controllers/employeeController");
const auth = require('../middleware/authMiddleWare.js');
const { validateId } = require('../middleware/validation.js');

const router = express.Router();

//console.log(auth);
router.get('/team', auth.authenticate, controllerAction.getTeamList);//:id added
router.get('/employee/:id',auth.authenticate, validateId, controllerAction.getEmployeeDetails);
router.get('/attendance/:id',auth.authenticate, validateId, controllerAction.getEmployeeAttendance);
router.get('/broadcasts',auth.authenticate, controllerAction.getDashboardBroadcasts);
router.get('/dashboard/:id',auth.authenticate, controllerAction.getDashboard);//:id added
router.get('/managers', auth.authenticate, auth.authorizeRoles("HR", "ADMIN"), ctrl.getAllManagers);
router.get('/manager/:id', auth.authenticate, auth.authorizeRoles("HR", "ADMIN"), ctrl.getManagersById);// Get manager by ID
router.get("/managers/subordinate/:managerId", auth.authenticate, auth.authorizeRoles("HR", "ADMIN"), ctrl.getSubordinates);
module.exports = router;
