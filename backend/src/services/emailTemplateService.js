const EmailTemplate = require('../models/EmailTemplate');

class emailTemplateService {
  async createTemplate(data) {
    if (data.allowedVariables && !Array.isArray(data.allowedVariables)) {
      throw new Error('allowedVariables must be an array');
    }

    return await EmailTemplate.create({
      type: data.type,
      subject: data.subject,
      body: data.body,
      allowedVariables: data.allowedVariables || []
    });
  }

  async updateTemplate(id, updateData) {
    const template = await EmailTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    return await template.update(updateData);
  }
  async getTemplateByType(type) {
    const template = await EmailTemplate.findOne({ where: { type } , attributes: ['id', 'type', 'subject', 'body', 'allowedVariables']});
    return template;
  };
  async deleteTemplate(id) {
    const template = await EmailTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    return await template.destroy();
  }
}

module.exports = new emailTemplateService();
