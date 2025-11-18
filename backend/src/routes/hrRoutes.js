const express = require('express');
const { addEmployeeHandler, getDashboard, getAllEmployees, getEmployee, editEmployee, uploadDocumentHandler, getOwnProfileHandler } = require('../controllers/hrController.js');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleWare.js');
const { validateId } = require('../middleware/validation.js');
const ctrl = require("../controllers/employeeController");
const upload = require("../middleware/uploadMiddleware");
const uploadEmployeeMiddleware = require("../middleware/UploadEmployeeProfileImage");
const Upload = require("../controllers/uploadController");
const leaveController = require("../controllers/leaveController");


const router = express.Router();

router.post('/add/employee', authenticate, authorizeRoles('HR','ADMIN'), ctrl.createEmployee);
//router.get('/dashboard', authenticate, authorizeRoles('HR','ADMIN'), getDashboard);//--> to be reviewed

router.get('/employee/:empCode', authenticate, authorizeRoles('HR','ADMIN'), validateId, ctrl.getEmployeeById);

router.put('/employee/:empCode', authenticate, authorizeRoles('HR','ADMIN'), validateId, ctrl.updateEmployee);
router.get("/leave-list", authenticate,authorizeRoles("MANAGER","USER","ADMIN"), leaveController.getLeavesList);




// Upload profile image
router.post("/:id/profile",authenticate,authorizeRoles("ADMIN","HR"), uploadEmployeeMiddleware, Upload.uploadFile);

// Upload document
router.post("/:id/document",authenticate,authorizeRoles("ADMIN","MANAGER","HR"), upload, Upload.uploadDocument);

// Get all uploads for employee
router.get("/:id/image", authenticate,authorizeRoles("ADMIN","HR","USER","MANAGER"),Upload.getFiles);
router.get("/:id/files", authenticate,authorizeRoles("ADMIN","HR","USER","MANAGER"),Upload.getDoc);

// Delete a file
router.delete("/image/:fileId",authenticate,authorizeRoles("HR","USER","ADMIN"), Upload.deleteImage);
router.delete("/:fileId",authenticate,authorizeRoles("HR","USER","ADMIN"), Upload.deleteFile);

// router.post('/upload-document', authenticate, authorizeRoles('HR'), uploadDocumentHandler);

// router.get('/own-profile', authenticate, authorizeRoles('HR'), getOwnProfileHandler);

module.exports = router;
