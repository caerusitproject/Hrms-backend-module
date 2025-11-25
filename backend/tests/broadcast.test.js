// tests/broadcast.test.js
const broadcastService = require('../src/services/broadcastService.js');
const broadcastController = require('../src/controllers/broadcastController.js');
const Broadcast = require('../src/models/Broadcast.js');
const { Op } = require('sequelize');

// Mock dependencies
jest.mock('../src/models/Broadcast.js', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));
jest.mock('sequelize', () => ({
  Op: {
    between: 'between',
  },
}));

jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Broadcast Controller & Service', () => {

  // ========== SERVICE TESTS ==========

  describe('createBroadcast()', () => {
    it('should create a broadcast successfully', async () => {
      const mockBroadcast = { id: 1, title: 'Hello', content: 'World' };
      Broadcast.create.mockResolvedValue(mockBroadcast);

      const result = await broadcastService.createBroadcast('Hello', 'World');
      expect(Broadcast.create).toHaveBeenCalledWith({ title: 'Hello', content: 'World' });
      expect(result).toEqual(mockBroadcast);
    });
  });

  describe('getAllBroadcastsOnly()', () => {
    it('should return all broadcasts ordered by id', async () => {
      const mockData = [{"id": 1, "title": "A"}];
      Broadcast.findAll.mockResolvedValue(mockData);

      const result = await broadcastService.getAllBroadcastsOnly();
      expect(Broadcast.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
        attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
        limit:10,
        offset:0
      });
      expect(result.data).toEqual(mockData);
    });

    it('should throw error on failure', async () => {
      Broadcast.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(broadcastService.getAllBroadcastsOnly()).rejects.toThrow('DB Error');
    });
  });

  describe('getAllBroadcasts()', () => {
    const mockData = [{ id: 1, title: 'Test' }];
    beforeEach(() => Broadcast.findAll.mockResolvedValue(mockData));

    it('should fetch today’s broadcasts', async () => {
      const result = await broadcastService.getAllBroadcasts('today');
      expect(Broadcast.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should fetch yesterday’s broadcasts', async () => {
      const result = await broadcastService.getAllBroadcasts('yesterday');
      expect(result).toEqual(mockData);
    });

    it('should fetch this month’s broadcasts', async () => {
      const result = await broadcastService.getAllBroadcasts('this-month');
      expect(result).toEqual(mockData);
    });

    it('should fetch last month’s broadcasts', async () => {
      const result = await broadcastService.getAllBroadcasts('last-month');
      expect(result).toEqual(mockData);
    });

    it('should throw error on invalid filter', async () => {
      await expect(broadcastService.getAllBroadcasts('invalid'))
        .rejects.toThrow('Invalid filter parameter. Use yesterday, today, this-month, or last-month');
    });

    it('should throw error if DB fails', async () => {
      Broadcast.findAll.mockRejectedValueOnce(new Error('DB Failure'));
      await expect(broadcastService.getAllBroadcasts('today')).rejects.toThrow('DB Failure');
    });
  });

  describe('updateBroadcast()', () => {
    it('should update broadcast successfully', async () => {
      const mockBroadcast = {
        id: 1,
        title: 'Old',
        content: 'Old content',
        save: jest.fn(),
      };
      Broadcast.findByPk.mockResolvedValue(mockBroadcast);

      const result = await broadcastService.updateBroadcast(1, 'New', 'New content');
      expect(Broadcast.findByPk).toHaveBeenCalledWith(1);
      expect(mockBroadcast.title).toBe('New');
      expect(mockBroadcast.content).toBe('New content');
      expect(mockBroadcast.save).toHaveBeenCalled();
      expect(result).toEqual(mockBroadcast);
    });

    it('should throw error if broadcast not found', async () => {
      Broadcast.findByPk.mockResolvedValue(null);
      await expect(broadcastService.updateBroadcast(1, 'New', 'New')).rejects.toThrow('Broadcast not found');
    });
  });

  // ========== CONTROLLER TESTS ==========

  describe('create()', () => {
    it('should create and return broadcast', async () => {
      const mockReq = { body: { title: 'T', content: 'C' } };
      const mockRes = { json: jest.fn() };
      const mockBroadcast = { id: 1, title: 'T', content: 'C' };

      jest.spyOn(broadcastService, 'createBroadcast').mockResolvedValue(mockBroadcast);

      await broadcastController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(mockBroadcast);
    });

    it('should handle missing title/content error', async () => {
      const mockReq = { body: {} };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const err = new Error('Title and content are required to create a broadcast');

      jest.spyOn(broadcastService, 'createBroadcast').mockRejectedValue(err);
      await broadcastController.create(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 400, message: err.message });
    });

    it('should handle internal server error', async () => {
      const mockReq = { body: { title: 'x', content: 'y' } };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      jest.spyOn(broadcastService, 'createBroadcast').mockRejectedValue(new Error('Unknown'));

      await broadcastController.create(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 500, message: 'Internal Server Error' });
    });
  });

  describe('getAllOnly()', () => {
    it('should return all broadcasts', async () => {
      const mockReq = {};
      const mockRes = { json: jest.fn() };
      const data = [{ id: 1, title: 'A' }];

      jest.spyOn(broadcastService, 'getAllBroadcastsOnly').mockResolvedValue(data);
      await broadcastController.getAllOnly(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(data);
    });

    it('should handle errors', async () => {
      const mockReq = {};
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(broadcastService, 'getAllBroadcastsOnly').mockRejectedValue(new Error('Failed'));
      await broadcastController.getAllOnly(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error:400, message: 'Failed' });
    });
  });

  describe('getAll()', () => {
    it('should return broadcasts by filter', async () => {
      const mockReq = { params: { filter: 'today' } };
      const mockRes = { json: jest.fn() };
      const data = [{ id: 1, title: 'A' }];

      jest.spyOn(broadcastService, 'getAllBroadcasts').mockResolvedValue(data);
      await broadcastController.getAll(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(data);
    });

    it('should handle error', async () => {
      const mockReq = { params: { filter: 'today' } };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      jest.spyOn(broadcastService, 'getAllBroadcasts').mockRejectedValue(new Error('Invalid'));

      await broadcastController.getAll(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 400, message: 'Invalid' });
    });
  });

  describe('update()', () => {
    it('should update broadcast successfully', async () => {
      const mockReq = { params: { id: 1 }, body: { title: 'New', content: 'C' } };
      const mockRes = { json: jest.fn() };
      const updated = { id: 1, title: 'New', content: 'C' };

      jest.spyOn(broadcastService, 'updateBroadcast').mockResolvedValue(updated);
      await broadcastController.update(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should handle not found error', async () => {
      const mockReq = { params: { id: 1 }, body: {} };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      jest.spyOn(broadcastService, 'updateBroadcast').mockRejectedValue(new Error('Broadcast not found'));

      await broadcastController.update(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 404, message: 'Broadcast not found' });
    });
  });
});
