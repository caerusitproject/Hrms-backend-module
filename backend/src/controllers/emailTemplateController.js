const emailTemplateService = require('../services/notification/emailTemplateService');

const createTemplate = async (req, res) => {
  try {
    const { type, subject, body, allowedVariables, isHtml } = req.body;
    const template = await emailTemplateService.createTemplate({
      type,
      subject,
      body,
      allowedVariables,
      isHtml
    });
    return res.status(201).json({ message: 'Template created successfully', template });
  } catch (error) {
    //console.log('DB error:', error);
    return res.status(500).json({ error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.query;
    const updated = await emailTemplateService.updateTemplate(id, req.body);
    return res.status(200).json({ message: 'Template updated', updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTemplateByType = async (req, res) => {
  try {
    const { type } = req.query;
    const template = await emailTemplateService.getTemplateByType(type);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.status(200).json({ message: 'Template retrieved', template });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllTemplateTypes = async (req, res) => {
  try {
    const templates = await emailTemplateService.getAllTemplateTypes();
    if (!templates || templates.length === 0) {
      return res.status(200).json({ message: 'No template types exist. Please create a new one.' });
    }
    return res.json({ message: 'Templates retrieved', templates });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllTemplate = async (req, res) => {
  try {
    
    const templates = await emailTemplateService.getAllTemplate();
    if (!templates || templates.length === 0) {
      return res.status(200).json({ message: 'No templates exist. Please create a new one.',templates:[] });
    }
    return res.status(200).json({ message: 'Templates retrieved', templates });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.query;
    await emailTemplateService.deleteTemplate(id);
    return res.status(200).json({ message: 'Template deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = { createTemplate, updateTemplate, getTemplateByType, getAllTemplateTypes, getAllTemplate, deleteTemplate };