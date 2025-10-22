const express = require('express');
const router = express.Router();
const controller = require('../../controllers/payroll/compensationController');
const { authenticate, authorizeRoles } = require("../../middleware/authMiddleWare");

// Admin can create/update compensation for an employee
router.post('/',authenticate, authorizeRoles('ADMIN'), controller.createOrUpdateCompensation);

// Get all compensations
router.get('/',authenticate, authorizeRoles('ADMIN'), controller.getAllCompensations);

// Get compensation by employee
router.get('/:employeeId',authenticate, authorizeRoles('ADMIN'), controller.getCompensationByEmployee);

// Delete a compensation record
router.delete('/:id',authenticate, authorizeRoles('ADMIN'), controller.deleteCompensation);

module.exports = router;