const request = require('supertest');
const app = require('../src/app');
const employeeController = require("../src/controllers/employeeController");
const EmployeeService = require("../src/services/employeeService");
const authService = require("../src/services/authService");
const bcrypt = require("bcrypt");

// 🧩 Mock dependencies
jest.mock("../src/services/employeeService", () => ({
  createEmployee: jest.fn(),
  getEmployeeById: jest.fn(),
  getAllEmployees: jest.fn(),
  updateEmployee: jest.fn(),
  uploadEmployeeImage: jest.fn(),
  assignManager: jest.fn(),
}));
jest.mock("bcrypt");

jest.mock("../src/services/authService", () => ({
  loginEmployee: jest.fn(),
}));

describe("Employee Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {}, file: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ------------------------------
  // createEmployee
  // ------------------------------
  describe("createEmployee", () => {
    it("should return 400 if missing required fields", async () => {
      req.body = { name: "" };
      await employeeController.createEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
    });

    it("should create employee successfully", async () => {
      req.body = { name: "John", email: "john@example.com" };
      const mockEmployee = { id: 1, name: "John" };
      EmployeeService.createEmployee.mockResolvedValue(mockEmployee);

      await employeeController.createEmployee(req, res);

      expect(EmployeeService.createEmployee).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Employee created successfully",
        employee: mockEmployee,
      });
    });

    it("should handle errors gracefully", async () => {
      req.body = { name: "John", email: "john@example.com" };
      const error = new Error("DB failed");
      EmployeeService.createEmployee.mockRejectedValue(error);

      await employeeController.createEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating employee",
        error: "DB failed",
      });
    });
  });

  // ------------------------------
  // loginEmployee
  // ------------------------------
  describe("loginEmployee", () => {
    it("should return tokens and userData on success", async () => {
      req.body = { email: "john@example.com", password: "secret" };
      const mockResponse = {
        accessToken: "abc123",
        refreshToken: "def456",
        userData: { id: 1, email: "john@example.com" },
      };
      authService.loginEmployee.mockResolvedValue(mockResponse);

      await employeeController.loginEmployee(req, res);

      expect(authService.loginEmployee).toHaveBeenCalledWith("john@example.com", "secret");
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle invalid credentials", async () => {
      const error = new Error("Invalid credentials");
      authService.loginEmployee.mockRejectedValue(error);
      req.body = { email: "x@y.com", password: "badpass" };

      await employeeController.loginEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });
  });

  // ------------------------------
  // getEmployeeById
  // ------------------------------
  describe("getEmployeeById", () => {
    it("should return employee by id", async () => {
      req.params.id = "1";
      const mockEmp = { id: 1, name: "Alice" };
      EmployeeService.getEmployeeById.mockResolvedValue(mockEmp);

      await employeeController.getEmployeeById(req, res);

      expect(EmployeeService.getEmployeeById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEmp);
    });

    it("should return 404 if not found", async () => {
      req.params.id = "99";
      EmployeeService.getEmployeeById.mockResolvedValue(null);

      await employeeController.getEmployeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
    });
  });

  // ------------------------------
  // updateEmployee
  // ------------------------------
  describe("updateEmployee", () => {
    it("should update employee successfully", async () => {
      req.params.id = "1";
      req.body = { name: "Updated" };
      const mockUpdated = { id: 1, name: "Updated" };
      EmployeeService.updateEmployee.mockResolvedValue(mockUpdated);

      await employeeController.updateEmployee(req, res);

      expect(EmployeeService.updateEmployee).toHaveBeenCalledWith("1", req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Employee updated successfully",
        employee: mockUpdated,
      });
    });

    it("should return 404 if not found", async () => {
      req.params.id = "10";
      EmployeeService.updateEmployee.mockResolvedValue(null);

      await employeeController.updateEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
    });
  });

  // ------------------------------
  // getAllEmployees
  // ------------------------------
  describe("getAllEmployees", () => {
    it("should return all employees", async () => {
      const mockList = [{ id: 1 }, { id: 2 }];
      EmployeeService.getAllEmployees.mockResolvedValue(mockList);

      await employeeController.getAllEmployees(req, res);

      expect(EmployeeService.getAllEmployees).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockList);
    });

    /*it("should handle DB error", async () => {
      const error = "DB error";
      EmployeeService.getAllEmployees.mockRejectedValue(error);

      await employeeController.getAllEmployees(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch employees" });
    });*/
  });

  // ------------------------------
  // uploadEmployeeImage
  // ------------------------------
 /* describe("uploadEmployeeImage", () => {
    it("should return 400 if no file uploaded", async () => {
      req.file = null;

      await employeeController.uploadEmployeeImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded" });
    });

    it("should upload image successfully", async () => {
      req.params.id = "1";
      req.file = { path: "/uploads/photo.jpg" };
      const mockEmployee = { id: 1, image: "/uploads/photo.jpg" };
      EmployeeService.uploadEmployeeImage.mockResolvedValue(mockEmployee);

      await employeeController.uploadEmployeeImage(req, res);

      expect(EmployeeService.uploadEmployeeImage).toHaveBeenCalledWith("1", "/uploads/photo.jpg");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Image uploaded successfully",
        employee: mockEmployee,
      });
    });
  });*/

  // ------------------------------
  // assignManager
  // ------------------------------
  describe("assignManager", () => {
    it("should assign manager successfully", async () => {
      req.body = { employeeId: 1, managerId: 2 }; // ✅ fix here
      const mockResponse = { id: 1, managerId: 2 };
      EmployeeService.assignManager.mockResolvedValue(mockResponse);

      await employeeController.assignManager(req, res);

      expect(EmployeeService.assignManager).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Manager assigned successfully",
        updated: mockResponse,
      });
    });
  });
});
