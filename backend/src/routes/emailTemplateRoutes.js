const emailTemplateController = require('../controllers/emailTemplateController');
const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleWare');

const router = express.Router();

// All routes restricted to authenticated users
//router.use(authenticate);   

// POST - Create new email template
router.post('/create',authenticate, authorizeRoles("ADMIN"), emailTemplateController.createTemplate);
// Patch - Update a template by ID or type
router.patch('/update',authenticate, authorizeRoles("ADMIN"), emailTemplateController.updateTemplate);

// DELETE - Delete template
router.delete('/delete',authenticate, authorizeRoles("ADMIN"), emailTemplateController.deleteTemplate);

// GET - Get template by type
router.get('/type',authenticate, authorizeRoles("ADMIN","HR"), emailTemplateController.getTemplateByType);

//Get the list of all email templates
router.get('/emails', authenticate, authorizeRoles("ADMIN","HR"), emailTemplateController.getAllTemplates); 


module.exports = router;
