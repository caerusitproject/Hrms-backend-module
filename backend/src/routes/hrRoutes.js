const express = require('express');
const { addEmployeeHandler, getDashboard, getAllEmployees, getEmployee, editEmployee, uploadDocumentHandler, getOwnProfileHandler } = require('../controllers/hrController.js');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleWare.js');
const { validateId } = require('../middleware/validation.js');
const ctrl = require("../controllers/employeeController");

const router = express.Router();

/**
 * @swagger
 * /hr/add-employee:
 *   post:
 *     summary: Add a new employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               designation:
 *                 type: string
 *               status:
 *                 type: string
 *               managerId:
 *                 type: string
 *               departmentId:
 *                 type: integer
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: Created employee
 */
router.post('/add/employee', authenticate, authorizeRoles('HR'), ctrl.createEmployee);

/**
 * @swagger
 * /hr/dashboard:
 *   get:
 *     summary: Get HR dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', authenticate, authorizeRoles('HR'), getDashboard);

/**
 * @swagger
 * /hr/all-employees:
 *   get:
 *     summary: Get list of all employees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get('/all/employees', authenticate, authorizeRoles('HR'), getAllEmployees);

/**
 * @swagger
 * /hr/employee/{empCode}:
 *   get:
 *     summary: Get employee profile by empCode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: empCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee profile
 */
router.get('/employee/:empCode', authenticate, authorizeRoles('HR'), validateId, getEmployee);

/**
 * @swagger
 * /hr/employee/{empCode}:
 *   put:
 *     summary: Edit employee profile by empCode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: empCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               designation:
 *                 type: string
 *               status:
 *                 type: string
 *               managerId:
 *                 type: string
 *               departmentId:
 *                 type: integer
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: Updated employee
 */
//router.put('/employee/edit/:empCode', authenticate, authorizeRoles('HR'), validateId, editEmployee);

/**
 * @swagger
 * /hr/upload-document:
 *   post:
 *     summary: Upload handbook or policy document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Uploaded document
 */
router.post('/upload-document', authenticate, authorizeRoles('HR'), uploadDocumentHandler);

/**
 * @swagger
 * /hr/own-profile:
 *   get:
 *     summary: Get own HR profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HR profile
 */
router.get('/own-profile', authenticate, authorizeRoles('HR'), getOwnProfileHandler);



module.exports = router;