const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow/workflowController');
const leaveWorkflow = require('../controllers/workflow/leaveWorkflowController')

router.use('/workflow', workflowController);
router.use('/leave', leaveWorkflow.create);

/*router.use('/leave', leaveController.create);
router.use('/leave/:id/submit', leaveController.submit);
router.use('/leave/:id/manager-approve', leaveController.managerApprove);
router.use('/leave/:id/hr-approve', leaveController.hrApprove);
router.use('/leave/:id/finalize', leaveController.finalize);
router.use('/leave/:id/reject', leaveController.reject);
router.use('/leave/:id/cancel', leaveController.cancel);*/

module.exports = router;