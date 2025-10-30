const emailController = require('../controllers/emailController');
const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleWare');

const router = express.Router();

router.post('/',authenticate, authorizeRoles("HR",'ADMIN'), emailController.sendMail);


module.exports = router;