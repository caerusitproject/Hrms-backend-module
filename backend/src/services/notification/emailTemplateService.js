const EmailTemplate = require('../../models/EmailTemplate');

class emailTemplateService {
  async createTemplate(data) {
    if (data.allowedVariables && !Array.isArray(data.allowedVariables)) {
      throw new Error('allowedVariables must be an array');
    }
    const { type, subject, body } = data;
    if (!type || typeof type !== 'string' || !type.trim()) {
      throw new Error('Template type is required and must be a non-empty string');
    }
    if (!subject || !subject.trim()) {
      throw new Error('Subject is required and must be a non-empty string');
    }
    if (!body || !body.trim()) {
      throw new Error('Body is required and must be a non-empty string');
    }
    const existingTemplate = await EmailTemplate.findOne({ type: type.trim() });
    if (existingTemplate) {
      throw new Error('Template type already exists. Please choose a different type name for the template.');
    }
    const template = await EmailTemplate.create({
      type: data.type,
      subject: data.subject,
      body: data.body,
      allowedVariables: data.allowedVariables || []
    });
    return template;
  }

  async updateTemplate(id, updateData) {
    if (!id || !updateData) { throw new Error("Either of the id or data given is invalid or empty please enter a valid id and valid body. ") }
    const template = await EmailTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    const updatedtemp = await template.update(updateData);
    return updatedtemp;
  }
  async getTemplateByType(type) {
    if (!type || !type.trim()) { throw new Error("please enter a valid type") }
    const template = await EmailTemplate.findOne({ where: { type }, attributes: ['id', 'type', 'subject', 'body', 'allowedVariables'] });
    return template;
  };

  async getAllTemplateTypes({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const tempType = await EmailTemplate.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'type', 'allowedVariables']
    });
    
    if (tempType.count ===0 ) {
      return { message: "NO templates exist in the database" };
    }
    return tempType;
  };


  async getAllTemplate() {
    const tempAll = await EmailTemplate.findAndCountAll({
      attributes: ['id', 'type', 'allowedVariables', 'subject', 'body']
    });
    if (tempAll.count ===0 ) {
      return { message: "NO templates exist in the database" };
    }
    return tempAll;
  };
  async deleteTemplate(id) {
    const template = await EmailTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    return await template.destroy();
  }
}

module.exports = new emailTemplateService();
