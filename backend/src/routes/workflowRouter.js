const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

router.use('/workflow', workflowController);

module.exports = router;