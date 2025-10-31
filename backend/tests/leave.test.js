const request = require('supertest');
const app = require('../src/app'); // ✅ correct import - do NOT use index.js
const leaveController = require("../src/controllers/leaveController");
const leaveService = require("../src/services/leaveService");
const managerService = require("../src/services/managerService");

// ✅ Mock dependencies
jest.mock("../src/services/leaveService", () => ({
  applyLeave: jest.fn(),
  updateLeave: jest.fn(),
  deleteLeave: jest.fn(),
  getLeavesCount: jest.fn(),
  getLeavesList: jest.fn(),
}));

jest.mock("../src/services/managerService", () => ({
  handleLeave: jest.fn(),
}));

describe("Leave Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // -----------------------------
  // applyLeave
  // -----------------------------
  describe("applyLeave", () => {
    it("should apply leave successfully", async () => {
      const mockLeave = { id: 1, reason: "Vacation" };
      leaveService.applyLeave.mockResolvedValue(mockLeave);

      req.body = { employeeId: 1, reason: "Vacation" };
      await leaveController.applyLeave(req, res);

      expect(leaveService.applyLeave).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leave applied successfully",
        leave: mockLeave,
      });
    });

    it("should handle apply leave error", async () => {
      const error = new Error("DB Error");
      leaveService.applyLeave.mockRejectedValue(error);

      await leaveController.applyLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 500,
        message: "DB Error",
      });
    });
  });

  // -----------------------------
  // updateLeave
  // -----------------------------
  describe("updateLeave", () => {
    it("should update leave successfully", async () => {
      const mockLeave = { id: 1, reason: "Updated reason" };
      leaveService.updateLeave.mockResolvedValue(mockLeave);

      req.params.id = 1;
      req.body = { reason: "Updated reason" };

      await leaveController.updateLeave(req, res);

      expect(leaveService.updateLeave).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leave updated successfully",
        leave: mockLeave,
      });
    });

    it("should handle update error", async () => {
      const error = new Error("Leave not found");
      leaveService.updateLeave.mockRejectedValue(error);
      req.params.id = 99;

      await leaveController.updateLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Leave not found",
      });
    });
  });

  // -----------------------------
  // deleteLeave
  // -----------------------------
  describe("deleteLeave", () => {
    it("should delete leave successfully", async () => {
      leaveService.deleteLeave.mockResolvedValue(true);
      req.params.id = 1;

      await leaveController.deleteLeave(req, res);

      expect(leaveService.deleteLeave).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leave deleted successfully",
      });
    });

    it("should handle delete error", async () => {
      const error = new Error("Leave not found");
      leaveService.deleteLeave.mockRejectedValue(error);
      req.params.id = 99;

      await leaveController.deleteLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Leave not found",
      });
    });
  });

  // -----------------------------
  // approveLeave
  // -----------------------------
  describe("approveLeave", () => {
    it("should approve leave successfully", async () => {
      const mockLeave = { id: 1, status: "APPROVED" };
      managerService.handleLeave.mockResolvedValue(mockLeave);
      req.params.id = 1;

      await leaveController.approveLeave(req, res);

      expect(managerService.handleLeave).toHaveBeenCalledWith(1, "APPROVED");
      expect(res.json).toHaveBeenCalledWith(mockLeave);
    });

    it("should handle approve error", async () => {
      const error = new Error("Manager not found");
      managerService.handleLeave.mockRejectedValue(error);
      req.params.id = 99;

      await leaveController.approveLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 500,
        message: "Manager not found",
      });
    });
  });

  // -----------------------------
  // rejectLeave
  // -----------------------------
  describe("rejectLeave", () => {
    it("should reject leave successfully", async () => {
      const mockLeave = { id: 1, status: "REJECTED" };
      managerService.handleLeave.mockResolvedValue(mockLeave);
      req.params.id = 1;

      await leaveController.rejectLeave(req, res);

      expect(managerService.handleLeave).toHaveBeenCalledWith(1, "REJECTED");
      expect(res.json).toHaveBeenCalledWith(mockLeave);
    });

    it("should handle reject error", async () => {
      const error = new Error("Failed");
      managerService.handleLeave.mockRejectedValue(error);
      req.params.id = 1;

      await leaveController.rejectLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 500,
        message: "Failed",
      });
    });
  });

  // -----------------------------
  // getLeavesCount
  // -----------------------------
  describe("getLeavesCount", () => {
    it("should return leave counts successfully", async () => {
      const mockCount = { PENDING: 1, APPROVED: 2, REJECTED: 0 };
      leaveService.getLeavesCount.mockResolvedValue(mockCount);

      await leaveController.getLeavesCount(req, res);

      expect(leaveService.getLeavesCount).toHaveBeenCalledWith(1, 0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ employeeId: 1, count: mockCount });
    });

    it("should handle count error", async () => {
      const error = new Error("Employee not found");
      leaveService.getLeavesCount.mockRejectedValue(error);

      await leaveController.getLeavesCount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Employee not found",
      });
    });
  });

  // -----------------------------
  // getLeavesCountMonth
  // -----------------------------
  describe("getLeavesCountMonth", () => {
    it("should return monthly leave counts", async () => {
      const mockCount = { APPROVED: 1 };
      leaveService.getLeavesCount.mockResolvedValue(mockCount);

      await leaveController.getLeavesCountMonth(req, res);

      expect(leaveService.getLeavesCount).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ employeeId: 1, count: mockCount });
    });

    it("should handle monthly count error", async () => {
      const error = new Error("Failed to fetch");
      leaveService.getLeavesCount.mockRejectedValue(error);

      await leaveController.getLeavesCountMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Failed to fetch",
      });
    });
  });

  // -----------------------------
  // getLeavesList
  // -----------------------------
  describe("getLeavesList", () => {
    it("should return employee leaves list", async () => {
      const mockLeaves = [{ id: 1, reason: "Vacation" }];
      leaveService.getLeavesList.mockResolvedValue(mockLeaves);

      await leaveController.getLeavesList(req, res);

      expect(leaveService.getLeavesList).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ employeeId: 1, leaves: mockLeaves });
    });

    it("should handle error in fetching leaves list", async () => {
      const error = new Error("DB Error");
      leaveService.getLeavesList.mockRejectedValue(error);

      await leaveController.getLeavesList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB Error" });
    });
  });
});
