const request = require('supertest');
const app = require('../src/app'); // ✅ correct import - do NOT use index.js
const leaveInfoController = require("../src/controllers/leaveInfoController");
const leaveInfoService = require("../src/services/leaveInfoService");

// 🧩 Mock the entire leaveInfoService module
jest.mock("../src/services/leaveInfoService");

describe("leaveInfoController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // -----------------------------
  // addOrUpdateLeave
  // -----------------------------
  describe("addOrUpdateLeave", () => {
    it("should return 400 if employeeId is missing", async () => {
      req.body = { reason: "Vacation" };

      await leaveInfoController.addOrUpdateLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee ID is required" });
    });

    it("should call service and return 201 when successful", async () => {
      req.body = { employeeId: 1, type: "Sick Leave" };
      const mockResponse = { id: 1, employeeId: 1, type: "Sick Leave" };
      leaveInfoService.addOrUpdateLeave.mockResolvedValue(mockResponse);

      await leaveInfoController.addOrUpdateLeave(req, res);

      expect(leaveInfoService.addOrUpdateLeave).toHaveBeenCalledWith(1, { type: "Sick Leave" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leaves added successfully",
        leaveInfo: mockResponse,
      });
    });

    it("should handle errors with 500", async () => {
      req.body = { employeeId: 1 };
      const error = new Error("Database error");
      leaveInfoService.addOrUpdateLeave.mockRejectedValue(error);

      await leaveInfoController.addOrUpdateLeave(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // -----------------------------
  // getAllLeaveInfo
  // -----------------------------
  describe("getAllLeaveInfo", () => {
    it("should return leave info list", async () => {
      const mockList = [{ id: 1 }, { id: 2 }];
      leaveInfoService.getAllLeaveInfo.mockResolvedValue(mockList);

      await leaveInfoController.getAllLeaveInfo(req, res);

      expect(leaveInfoService.getAllLeaveInfo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leaves data retrieved successfully",
        leaveInfoList: mockList,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Failed to load data");
      leaveInfoService.getAllLeaveInfo.mockRejectedValue(error);

      await leaveInfoController.getAllLeaveInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to load data" });
    });
  });

  // -----------------------------
  // getLeaveInfoByEmployee
  // -----------------------------
  describe("getLeaveInfoByEmployee", () => {
    it("should return leave info for employee", async () => {
      req.params.id = "1";
      const mockLeave = { id: 1, employeeId: 1, type: "Casual" };
      leaveInfoService.getLeaveInfoByEmployee.mockResolvedValue(mockLeave);

      await leaveInfoController.getLeaveInfoByEmployee(req, res);

      expect(leaveInfoService.getLeaveInfoByEmployee).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leave info retrieved successfully",
        leaveInfo: mockLeave,
      });
    });

    it("should return 404 if no leave found", async () => {
      req.params.id = "2";
      leaveInfoService.getLeaveInfoByEmployee.mockResolvedValue(null);

      await leaveInfoController.getLeaveInfoByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Leave info not found for the employee",
      });
    });

    it("should handle errors gracefully", async () => {
      req.params.id = "3";
      const error = new Error("DB failed");
      leaveInfoService.getLeaveInfoByEmployee.mockRejectedValue(error);

      await leaveInfoController.getLeaveInfoByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB failed" });
    });
  });

  // -----------------------------
  // deleteLeaveInfo
  // -----------------------------
  describe("deleteLeaveInfo", () => {
    it("should delete and return success", async () => {
      req.params.id = "5";
      const mockResult = { message: "Deleted successfully" };
      leaveInfoService.deleteLeaveInfo.mockResolvedValue(mockResult);

      await leaveInfoController.deleteLeaveInfo(req, res);

      expect(leaveInfoService.deleteLeaveInfo).toHaveBeenCalledWith("5");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle delete error", async () => {
      req.params.id = "10";
      const error = new Error("Delete failed");
      leaveInfoService.deleteLeaveInfo.mockRejectedValue(error);

      await leaveInfoController.deleteLeaveInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Delete failed" });
    });
  });
});