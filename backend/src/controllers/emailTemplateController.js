const emailTemplateService = require('../services/emailTemplateService');

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
    res.status(201).json({ message: 'Template created successfully', template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await emailTemplateService.updateTemplate(id, req.body);
    res.json({ message: 'Template updated', updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTemplateByType = async (req, res) => {
  try {
    const { type } = req.query;
    const template = await emailTemplateService.getTemplateByType(type);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template retrieved', template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await emailTemplateService.deleteTemplate(id);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createTemplate, updateTemplate, getTemplateByType, deleteTemplate };