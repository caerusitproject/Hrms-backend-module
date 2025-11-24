const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");
/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Department management
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Department]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
 */
router.post("/", authenticate, authorizeRoles("ADMIN"), departmentController.create);
router.get("/",authenticate, authorizeRoles("ADMIN","HR", "MANAGER", "USER"), departmentController.getAll);
router.get("/:id", authenticate, authorizeRoles("ADMIN",'USER','HR','MANAGER'), departmentController.getById);
router.patch("/:id", authenticate, authorizeRoles("ADMIN"), departmentController.update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), departmentController.delete);
module.exports = router;