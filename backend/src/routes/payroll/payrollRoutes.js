const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleWare');
const controller = require('../../controllers/payroll/payrollController');
const compctrl = require('../../controllers/payroll/compensationController')

router.post('/generate', controller.generatePayrollForEmployee);
router.post('/finalizepay', controller.finalizePayroll);
router.post('/compensation', compctrl.createOrUpdateCompensation);
router.get('/employee-list',auth.authenticate, auth.authorizeRoles("ADMIN"), compctrl.getEmployeeList);
//router.get('/:employeeId/:month', controller.getPayrollByEmployee);

// Get all payroll records
//router.get('/', controller.getAllPayrolls);
/*
// Generate payroll for all employees (Finalize)
router.post('/finalize', controller.finalizePayroll);

// Generate payroll for a single employee
router.post('/generate', controller.generatePayrollForEmployee);

// Get all payroll records
router.get('/', controller.getAllPayrolls);

// Get payroll details for one employee for a given month
router.get('/:employeeId/:month', controller.getPayrollByEmployee);
*/



module.exports = router;