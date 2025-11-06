// tests/emailTemplateService.test.js


jest.mock('../src/models/EmailTemplate');

describe('emailTemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const EmailTemplate = require('../src/models/EmailTemplate');
  const emailTemplateService = require('../src/services/notification/emailTemplateService');

  // ✅ createTemplate
  describe('createTemplate', () => {
    it('should create a new template successfully', async () => {
      const data = {
        type: 'LEAVE_REQUEST',
        subject: 'Leave Request Notification',
        body: 'Hello {{employee}}, your leave has been {{status}}.',
        allowedVariables: ['employee', 'status']
      };

      const createdTemplate = { id: 1, ...data };
      EmailTemplate.create.mockResolvedValue(createdTemplate);

      const result = await emailTemplateService.createTemplate(data);

      expect(EmailTemplate.create).toHaveBeenCalledWith({
        type: data.type,
        subject: data.subject,
        body: data.body,
        allowedVariables: data.allowedVariables
      });
      expect(result).toEqual(createdTemplate);
    });

    it('should throw an error if allowedVariables is not an array', async () => {
      const data = {
        type: 'LEAVE_REQUEST',
        subject: 'Test',
        body: 'Body',
        allowedVariables: 'invalid'
      };

      await expect(emailTemplateService.createTemplate(data)).rejects.toThrow(
        'allowedVariables must be an array'
      );
      expect(EmailTemplate.create).not.toHaveBeenCalled();
    });
  });

  // ✅ updateTemplate
  describe('updateTemplate', () => {
    it('should update a template successfully', async () => {
      const id = 1;
      const updateData = { subject: 'Updated Subject' };
      const mockTemplate = { update: jest.fn().mockResolvedValue({ id, ...updateData }) };

      EmailTemplate.findByPk.mockResolvedValue(mockTemplate);

      const result = await emailTemplateService.updateTemplate(id, updateData);

      expect(EmailTemplate.findByPk).toHaveBeenCalledWith(id);
      expect(mockTemplate.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({ id, ...updateData });
    });

    it('should throw error if template not found', async () => {
      EmailTemplate.findByPk.mockResolvedValue(null);

      await expect(emailTemplateService.updateTemplate(99, {})).rejects.toThrow('Template not found');
    });
  });

  // ✅ getTemplateByType
  describe('getTemplateByType', () => {
    it('should return a template by type', async () => {
      const type = 'WELCOME_EMAIL';
      const mockTemplate = { id: 1, type, subject: 'Welcome', body: 'Hi there!' };

      EmailTemplate.findOne.mockResolvedValue(mockTemplate);

      const result = await emailTemplateService.getTemplateByType(type);

      expect(EmailTemplate.findOne).toHaveBeenCalledWith({
        where: { type },
        attributes: ['id', 'type', 'subject', 'body', 'allowedVariables']
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should return null if template not found', async () => {
      EmailTemplate.findOne.mockResolvedValue(null);

      const result = await emailTemplateService.getTemplateByType('NOT_EXIST');
      expect(result).toBeNull();
    });
  });

  // ✅ getAllTemplateTypes
  describe('getAllTemplateTypes', () => {
    it('should return paginated template types', async () => {
      const mockResponse = {
        count: 2,
        rows: [
          { id: 1, type: 'WELCOME_EMAIL', allowedVariables: [] },
          { id: 2, type: 'RESET_PASSWORD', allowedVariables: [] }
        ]
      };

      EmailTemplate.findAndCountAll.mockResolvedValue(mockResponse);

      const result = await emailTemplateService.getAllTemplateTypes({ page: 1, limit: 10 });

      expect(EmailTemplate.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        attributes: ['id', 'type', 'allowedVariables']
      });
      expect(result).toEqual(mockResponse);
    });
  });

  // ✅ getAllTemplate
  describe('getAllTemplate', () => {
    it('should return all templates with details', async () => {
      const mockResponse = {
        count: 1,
        rows: [{ id: 1, type: 'EMAIL', subject: 'Sub', body: 'Body', allowedVariables: [] }]
      };

      EmailTemplate.findAndCountAll.mockResolvedValue(mockResponse);

      const result = await emailTemplateService.getAllTemplate();

      expect(EmailTemplate.findAndCountAll).toHaveBeenCalledWith({
        attributes: ['id', 'type', 'allowedVariables', 'subject', 'body']
      });
      expect(result).toEqual(mockResponse);
    });
  });

  // ✅ deleteTemplate
  describe('deleteTemplate', () => {
    it('should delete a template successfully', async () => {
      const id = 1;
      const mockTemplate = { destroy: jest.fn().mockResolvedValue(true) };

      EmailTemplate.findByPk.mockResolvedValue(mockTemplate);

      const result = await emailTemplateService.deleteTemplate(id);

      expect(EmailTemplate.findByPk).toHaveBeenCalledWith(id);
      expect(mockTemplate.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error if template not found', async () => {
      EmailTemplate.findByPk.mockResolvedValue(null);

      await expect(emailTemplateService.deleteTemplate(999)).rejects.toThrow('Template not found');
    });
  });
});
