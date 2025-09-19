const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const ctrl = require("../controllers/uploadController");

// Upload profile image
router.post("/:id/profile", upload.single("profile"), ctrl.uploadFile);

// Upload document
router.post("/:id/document", upload.single("document"), ctrl.uploadFile);

// Get all uploads for employee
router.get("/:id/files", ctrl.getFiles);

// Delete a file
router.delete("/:fileId", ctrl.deleteFile);

module.exports = router;