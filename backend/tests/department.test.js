const departmentController = require("../src/controllers/departmentController");
const departmentService = require("../src/services/departmentService");

// ✅ Mock the service layer completely
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
      const mockDepartments = [{ id: 1, name: "HR" }];
      departmentService.getAll.mockResolvedValue(mockDepartments);

      await departmentController.getAll(req, res);

      expect(departmentService.getAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockDepartments);
    });
  });

  // ------------------------------
  // getById()
  // ------------------------------
  describe("getById", () => {
    it("should return department by ID", async () => {
      req.params.id = 1;
      const mockDepartment = { id: 1, name: "Finance" };
      departmentService.getById.mockResolvedValue(mockDepartment);

      await departmentController.getById(req, res);

      expect(departmentService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDepartment);
    });

    it("should return 404 if department not found", async () => {
      req.params.id = 99;
      departmentService.getById.mockResolvedValue(null);

      await departmentController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Department not found" });
    });
  });

  // ------------------------------
  // create()
  // ------------------------------
  describe("create", () => {
    it("should create a new department", async () => {
      req.body = { name: "IT" };
      const mockDepartment = { id: 1, name: "IT" };
      departmentService.create.mockResolvedValue(mockDepartment);

      await departmentController.create(req, res);

      expect(departmentService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockDepartment);
    });
  });

  // ------------------------------
  // update()
  // ------------------------------
  describe("update", () => {
    it("should update existing department", async () => {
      req.params.id = 1;
      req.body = { name: "Operations" };
      const updatedDept = { id: 1, name: "Operations" };
      departmentService.update.mockResolvedValue(updatedDept);

      await departmentController.update(req, res);

      expect(departmentService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(updatedDept);
    });

    it("should return 404 if department not found", async () => {
      req.params.id = 100;
      departmentService.update.mockResolvedValue(null);

      await departmentController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Department not found" });
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
      expect(res.json).toHaveBeenCalledWith({ error: "Department not found" });
    });
  });
});
