const roleController = require("../src/controllers/roleController");
const roleServ = require("../src/services/roleService");
const Role = require("../src/models/Role");

// ✅ Mock service layer
jest.mock("../src/services/roleService", () => ({
  createRole: jest.fn(),
  getRoles: jest.fn(),
}));

describe("Role Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ------------------------------
  // addRole()
  // ------------------------------
  describe("addRole", () => {
    it("should create a role successfully", async () => {
      req.body = { name: "ADMIN_ROLE", role: "ADMIN" };
      const mockRole = { id: 1, name: "ADMIN_ROLE", role: "ADMIN" };
      roleServ.createRole.mockResolvedValue(mockRole);

      await roleController.addRole(req, res);

      expect(roleServ.createRole).toHaveBeenCalledWith("ADMIN_ROLE", "ADMIN");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Role created successfully",
        roledata: mockRole,
      });
    });

    it("should return 400 if name is missing", async () => {
      req.body = { role: "ADMIN" };

      await roleController.addRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Role name is required" });
    });

    it("should handle service error gracefully", async () => {
      req.body = { name: "TEST_ROLE", role: "TEST" };
      const error = new Error("Database error");
      roleServ.createRole.mockRejectedValue(error);

      await roleController.addRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // ------------------------------
  // listRoles()
  // ------------------------------
  describe("listRoles", () => {
    it("should return all roles successfully", async () => {
      const mockRoles = [
        { id: 1, name: "ADMIN_ROLE", role: "ADMIN" },
        { id: 2, name: "USER_ROLE", role: "USER" },
      ];
      roleServ.getRoles.mockResolvedValue(mockRoles);

      await roleController.listRoles(req, res);

      expect(roleServ.getRoles).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRoles);
    });

    it("should return 400 if no roles are found", async () => {
      roleServ.getRoles.mockResolvedValue(null);

      await roleController.listRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Role not found" });
    });

    it("should handle service error gracefully", async () => {
      const error = new Error("Internal Server Error");
      roleServ.getRoles.mockRejectedValue(error);

      await roleController.listRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
});