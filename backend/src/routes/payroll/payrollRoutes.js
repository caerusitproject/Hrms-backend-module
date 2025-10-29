const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleWare');
const controller = require('../../controllers/payroll/payrollController');
const compctrl = require('../../controllers/payroll/compensationController')

router.post('/generate', controller.generatePayrollForEmployee);
router.post('/finalizepay', controller.finalizePayroll);
router.post('/compensation', compctrl.createOrUpdateCompensation);
router.get('/employee-list',auth.authenticate, auth.authorizeRoles("ADMIN"), compctrl.getEmployeeList);
router.get('/not_generated',auth.authenticate, auth.authorizeRoles("ADMIN"),controller.getNotGenerated);
router.get('/created',auth.authenticate, auth.authorizeRoles("ADMIN"),controller.getCreated);
router.get('/filter',auth.authenticate,auth.authorizeRoles("ADMIN"), controller.getFilteredPayrolls);//make sure the month is being saved in the payroll table as 09,08 and so on because we are doing string matching in the code.
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