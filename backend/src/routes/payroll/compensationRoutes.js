const express = require('express');
const router = express.Router();
const controller = require('../../controllers/payroll/compensationController');
//const { authenticate, authorizeRoles } = require("../middleware/authMiddleWare");

// Admin can create/update compensation for an employee
router.post('/', controller.createOrUpdateCompensation);

// Get all compensations
router.get('/', controller.getAllCompensations);

// Get compensation by employee
router.get('/:employeeId', controller.getCompensationByEmployee);

// Delete a compensation record
router.delete('/:id', controller.deleteCompensation);

module.exports = router;