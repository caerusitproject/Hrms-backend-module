const express = require('express');
const { getTeamList, getEmployeeDetails, getEmployeeAttendance, getDashboardBroadcasts } = require('../controllers/managerController.js');
//
const auth = require('../middleware/authMiddleWare.js');
const { validateId } = require('../middleware/validation.js');

const router = express.Router();

router.get('/team', auth, getTeamList);
router.get('/employee/:id', auth, validateId, getEmployeeDetails);
router.get('/attendance/:id', auth, validateId, getEmployeeAttendance);
router.get('/broadcasts', auth, getDashboardBroadcasts);

module.exports = router;