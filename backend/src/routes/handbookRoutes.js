const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/handbookController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");
const upload = require("../middleware/handbookUpload");
// Create a new handbook entry
router.post("/", authenticate, authorizeRoles("ADMIN", "HR"), upload, ctrl.createHandbook);
// Get all handbook entries
router.get("/", authenticate, authorizeRoles("ADMIN", "HR", "USER", "MANAGER"),  ctrl.getAllHandbooks);
// Get a specific handbook entry by ID
router.get("/:id", authenticate, authorizeRoles("ADMIN", "HR", "USER", "MANAGER"), ctrl.getHandbookById);
// Update a handbook entry by ID
router.put("/:id", authenticate, authorizeRoles("ADMIN", "HR"), upload,ctrl.updateHandbook);
// Delete a handbook entry by ID
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "HR"), ctrl.deleteHandbook);
module.exports = router;