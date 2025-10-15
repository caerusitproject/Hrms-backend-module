const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");


router.get("/",authenticate, authorizeRoles("ADMIN","HR", "MANAGER", "USER"), departmentController.getAll);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), departmentController.getById);
router.post("/", authenticate, authorizeRoles("ADMIN"), departmentController.create);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), departmentController.update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), departmentController.delete);
module.exports = router;