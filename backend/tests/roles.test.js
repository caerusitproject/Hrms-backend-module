const request = require("supertest");
const app = require("../src/app");

// 🧪 Mock the Role model

jest.mock("../src/services/roleService", () => ({
  createRole: jest.fn(),
  getRoles: jest.fn(),
  getRoleNameById: jest.fn(),
}));

const mockRoleService = require("../src/services/roleService");
const roleController = require("../src/controllers/roleController");

describe("Roles Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Create Role - Success
  test("Role - Create - success", async () => {
    const mockRole = { id: 1, name: "Supervisor", role : "Tempale" };
    mockRoleService.createRole.mockResolvedValue(mockRole);

    const res = await request(app)
      .post("/api/roles")
      .send({name: "Supervisor", role : "Tempale"});

    // mock resolves correctly
    //expect(Role.create).toHaveBeenCalledWith({ name: "Supervisor" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Role created successfully");
    expect(res.body.roledata).toHaveProperty("name", "Supervisor");
  });

  // 🚫 Missing name
  test("Role - Create - missing name", async () => {
    const res = await request(app).post("/api/roles").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Role name is required");
  });

  // ✅ List Roles
  test("Role - List - success", async () => {
    const mockRoles = [
      { id: 1, name: "HR" },
      { id: 2, name: "Manager" },
    ];
    mockRoleService.getRoles.mockResolvedValue(mockRoles);

    const res = await request(app).get("/api/roles");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockRoles);
  });
});
