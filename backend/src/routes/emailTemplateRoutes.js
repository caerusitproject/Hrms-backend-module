const emailTemplateController = require('../controllers/emailTemplateController');
const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleWare');

const router = express.Router();

// All routes restricted to authenticated users
//router.use(authenticate);   
router.post('/create',authenticate, authorizeRoles("ADMIN"), emailTemplateController.createTemplate);
router.patch('/update',authenticate, authorizeRoles("ADMIN"), emailTemplateController.updateTemplate);
router.delete('/delete',authenticate, authorizeRoles("ADMIN"), emailTemplateController.deleteTemplate);
router.get('/',authenticate, authorizeRoles("ADMIN","HR"), emailTemplateController.getTemplateByType);
router.get('/types', authenticate, authorizeRoles("ADMIN","HR"), emailTemplateController.getAllTemplateTypes); 
router.get('/all', authenticate, authorizeRoles("ADMIN","HR"), emailTemplateController.getAllTemplate);
module.exports = router;
