// tests/emailTemplateController.test.js
const emailTemplateService = require('../src/services/notification/emailTemplateService');
const controller = require('../src/controllers/emailTemplateController'); 

jest.mock('../src/services/notification/emailTemplateService');

describe('Email Template Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ✅ createTemplate
  describe('createTemplate', () => {
    it('should create a template successfully', async () => {
      req.body = {
        type: 'welcome',
        subject: 'Welcome Email',
        body: 'Hello {{name}}',
        allowedVariables: ['name'],
        isHtml: true,
      };

      const mockTemplate = { id: 1, ...req.body };
      emailTemplateService.createTemplate.mockResolvedValue(mockTemplate);

      await controller.createTemplate(req, res);

      expect(emailTemplateService.createTemplate).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Template created successfully',
        template: mockTemplate,
      });
    });

    it('should handle service error', async () => {
      const error = new Error('DB error');
      emailTemplateService.createTemplate.mockRejectedValue(error);

      await controller.createTemplate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  // ✅ updateTemplate
  describe('updateTemplate', () => {
    it('should update a template successfully', async () => {
      req.query = { id: 1 };
      req.body = { subject: 'Updated Subject' };
      const updated = { id: 1, subject: 'Updated Subject' };
      emailTemplateService.updateTemplate.mockResolvedValue(updated);

      await controller.updateTemplate(req, res);

      expect(emailTemplateService.updateTemplate).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Template updated',
        updated,
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Update failed');
      emailTemplateService.updateTemplate.mockRejectedValue(error);

      await controller.updateTemplate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
    });
  });

  // ✅ getTemplateByType
  describe('getTemplateByType', () => {
    it('should return template if found', async () => {
      req.query = { type: 'welcome' };
      const mockTemplate = { id: 1, type: 'welcome' };
      emailTemplateService.getTemplateByType.mockResolvedValue(mockTemplate);

      await controller.getTemplateByType(req, res);

      expect(emailTemplateService.getTemplateByType).toHaveBeenCalledWith('welcome');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Template retrieved',
        template: mockTemplate,
      });
    });

    it('should return 404 if not found', async () => {
      req.query = { type: 'missing' };
      emailTemplateService.getTemplateByType.mockResolvedValue(null);

      await controller.getTemplateByType(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Template not found' });
    });

    it('should handle service error', async () => {
      const error = new Error('DB failed');
      emailTemplateService.getTemplateByType.mockRejectedValue(error);

      await controller.getTemplateByType(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failed' });
    });
  });

  // ✅ getAllTemplateTypes
  describe('getAllTemplateTypes', () => {
    it('should return template types', async () => {
      req.query = { page: 1, limit: 10 };
      const mockTemplates = { count: 1, rows: [{ id: 1, type: 'welcome' }] };
      emailTemplateService.getAllTemplateTypes.mockResolvedValue(mockTemplates);

      await controller.getAllTemplateTypes(req, res);

      expect(emailTemplateService.getAllTemplateTypes).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Templates retrieved',
        templates: mockTemplates,
      });
    });

    it('should handle service error', async () => {
      const error = new Error('Service failed');
      emailTemplateService.getAllTemplateTypes.mockRejectedValue(error);

      await controller.getAllTemplateTypes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service failed' });
    });
  });

  // ✅ getAllTemplate
  describe('getAllTemplate', () => {
    it('should return all templates', async () => {
      const mockTemplates = { count: 2, rows: [{ id: 1 }, { id: 2 }] };
      emailTemplateService.getAllTemplate.mockResolvedValue(mockTemplates);

      await controller.getAllTemplate(req, res);

      expect(emailTemplateService.getAllTemplate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Templates retrieved',
        templates: mockTemplates,
      });
    });

    it('should handle getAllTemplate error', async () => {
      const error = new Error('Failed');
      emailTemplateService.getAllTemplate.mockRejectedValue(error);

      await controller.getAllTemplate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed' });
    });
  });

  // ✅ deleteTemplate
  describe('deleteTemplate', () => {
    it('should delete a template successfully', async () => {
      req.query = { id: 1 };
      emailTemplateService.deleteTemplate.mockResolvedValue(true);

      await controller.deleteTemplate(req, res);

      expect(emailTemplateService.deleteTemplate).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template deleted' });
    });

    it('should handle delete error', async () => {
      const error = new Error('Delete failed');
      emailTemplateService.deleteTemplate.mockRejectedValue(error);

      await controller.deleteTemplate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete failed' });
    });
  });
});
