const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleWare");
const upload = require("../middleware/uploadMiddleware");
const uploadEmployeeMiddleware = require("../middleware/UploadEmployeeProfileImage");
const ctrl = require("../controllers/uploadController");

// Upload profile image
router.post("/:id/profile",auth.authenticate,auth.authorizeRoles("ADMIN","HR","USER"), uploadEmployeeMiddleware, ctrl.uploadFile);
// Upload document
router.post("/:id/document",auth.authenticate,auth.authorizeRoles("ADMIN","MANAGER","HR"), upload, ctrl.uploadDocument);

// Get all uploads for employee
router.get("/:id/image", auth.authenticate,auth.authorizeRoles("ADMIN","HR","USER","MANAGER"),ctrl.getFiles);
router.get("/:id/files", auth.authenticate,auth.authorizeRoles("ADMIN","HR","USER","MANAGER"),ctrl.getDoc);

// Delete a file
router.delete("/image/:fileId",auth.authenticate,auth.authorizeRoles("HR","USER","ADMIN"), ctrl.deleteImage);
router.delete("/:fileId",auth.authenticate,auth.authorizeRoles("HR","USER","ADMIN"), ctrl.deleteFile);

module.exports = router;
