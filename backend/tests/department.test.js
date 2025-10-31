const request = require('supertest');
const app = require('../src/app');
const departmentController = require("../src/controllers/departmentController");
const departmentService = require("../src/services/departmentService");

// ✅ Mock service methods
jest.mock("../src/services/departmentService", () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

describe("DepartmentController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ------------------------------
  // getAll()
  // ------------------------------
  describe("getAll", () => {
    it("should return all departments", async () => {
      const mockDepartments = [{ id: 1, departmentName: "HR" }];
      departmentService.getAll.mockResolvedValue(mockDepartments);

      await departmentController.getAll(req, res);

      expect(departmentService.getAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockDepartments);
    });

    it("should return 404 if service throws error", async () => {
      const error = new Error("Error while retrieving the departments");
      departmentService.getAll.mockRejectedValue(error);

      await departmentController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Error while retrieving the departments",
      });
    });
  });

  // ------------------------------
  // getById()
  // ------------------------------
  describe("getById", () => {
    it("should return department by id", async () => {
      req.params.id = 1;
      const mockDepartment = { id: 1, departmentName: "Finance" };
      departmentService.getById.mockResolvedValue(mockDepartment);

      await departmentController.getById(req, res);

      expect(departmentService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDepartment);
    });

    it("should return 404 if not found", async () => {
      req.params.id = 2;
      departmentService.getById.mockResolvedValue(null);

      await departmentController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Department not found",
      });
    });
  });

  // ------------------------------
  // create()
  // ------------------------------
  describe("create", () => {
    it("should create department successfully", async () => {
      req.body = { departmentName: "IT", description: "Tech team" };
      const mockDepartment = { id: 1, ...req.body };
      departmentService.create.mockResolvedValue(mockDepartment);

      await departmentController.create(req, res);

      expect(departmentService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockDepartment);
    });

    it("should return 400 if validation fails", async () => {
      const error = new Error("Department name or description not filled please enter valid data");
      departmentService.create.mockRejectedValue(error);

      await departmentController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 400,
        message: "Department name or description not filled please enter valid data",
      });
    });
  });

  // ------------------------------
  // update()
  // ------------------------------
  describe("update", () => {
    it("should update department successfully", async () => {
      req.params.id = 1;
      req.body = { departmentName: "Admin", description: "Updated" };
      const mockDepartment = { id: 1, ...req.body };
      departmentService.update.mockResolvedValue(mockDepartment);

      await departmentController.update(req, res);

      expect(departmentService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(mockDepartment);
    });

    it("should return 404 for 'Department not found' error", async () => {
      const error = new Error("Department not found");
      departmentService.update.mockRejectedValue(error);
      req.params.id = 5;

      await departmentController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Department not found",
      });
    });

    it("should return 404 for validation error", async () => {
      const error = new Error(
        "Department name or description not filled atleast one value should be present please enter valid data"
      );
      departmentService.update.mockRejectedValue(error);
      req.params.id = 5;

      await departmentController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message:
          "Department name or description not filled atleast one value should be present please enter valid data",
      });
    });

    it("should return 500 for other errors", async () => {
      const error = new Error("Database failure");
      departmentService.update.mockRejectedValue(error);
      req.params.id = 5;

      await departmentController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 500,
        message: "Internal server Error",
      });
    });
  });

  // ------------------------------
  // delete()
  // ------------------------------
  describe("delete", () => {
    it("should delete department successfully", async () => {
      req.params.id = 1;
      departmentService.delete.mockResolvedValue(true);

      await departmentController.delete(req, res);

      expect(departmentService.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if department not found", async () => {
      req.params.id = 99;
      departmentService.delete.mockResolvedValue(false);

      await departmentController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 404,
        message: "Department not found",
      });
    });
  });
});
