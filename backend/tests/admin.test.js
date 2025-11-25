const adminController = require("../src/controllers/admin/adminController");
const adminService = require("../src/services/admin/adminService");

jest.mock("../src/services/admin/adminService");
jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe("AdminController", () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, user: { id: 10 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        adminService.getAllEmployees = jest.fn();
        adminService.approveLeave = jest.fn();
        adminService.rejectLeave = jest.fn();
        jest.clearAllMocks();
    });

    describe("getAllEmployees", () => {
        it("should return employees", async () => {
            const employees = [{ id: 1 }];
            adminService.getAllEmployees.mockResolvedValue(employees);
            await adminController.getAllEmployees(req, res);

            expect(adminService.getAllEmployees).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(employees);
        });

        it("should handle errors", async () => {
            adminService.getAllEmployees.mockRejectedValue(new Error("DB error"));
            await adminController.getAllEmployees(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
        });


    });

    describe("createRole", () => {
        it("should create a role successfully", async () => {
            const mockRole = { id: 1, name: "ADMIN_ROLE", role: "ADMIN" };
            req.body = { name: "ADMIN_ROLE", role: "ADMIN" }; // ✅ matches controller check
            adminService.createRole.mockResolvedValue(mockRole);
            await adminController.createRole(req, res);
            expect(adminService.createRole).toHaveBeenCalledWith("ADMIN_ROLE", "ADMIN");
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockRole);
        });

        it("should handle error", async () => {
            adminService.createRole.mockRejectedValue(new Error("Role exists"));
            await adminController.createRole(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 400, message: "name or role missing" });
        });


    });

    describe("getRoles", () => {
        it("should return all roles", async () => {
            const roles = [{ id: 1 }];
            adminService.getAllRoles.mockResolvedValue(roles);


            await adminController.getRoles(req, res);

            expect(adminService.getAllRoles).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(roles);
        });

        it("should handle errors", async () => {
            adminService.getAllRoles.mockRejectedValue(new Error("Fail"));
            await adminController.getRoles(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Fail" });
        });


    });

    describe("deleteRole", () => {
        it("should delete a role", async () => {
            req.params.id = 1;
            adminService.deleteRole.mockResolvedValue(1);


            await adminController.deleteRole(req, res);

            expect(adminService.deleteRole).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: "Role deleted" });
        });

        it("should handle errors", async () => {
            adminService.deleteRole.mockRejectedValue(new Error("DB error"));
            await adminController.deleteRole(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
        });


    });

    describe("assignRoles", () => {
        it("should assign roles successfully", async () => {
            req.body = { employeeId: 5, roleIds: [1, 2] };
            const emp = { id: 5 };
            adminService.assignRoles.mockResolvedValue(emp);


            await adminController.assignRoles(req, res);

            expect(adminService.assignRoles).toHaveBeenCalledWith(5, [1, 2]);
            expect(res.json).toHaveBeenCalledWith({ message: "Roles updated", emp });
        });

        it("should handle errors", async () => {
            adminService.assignRoles.mockRejectedValue(new Error("Employee not found"));
            await adminController.assignRoles(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
        });


    });

    describe("createDepartment", () => {
        it("should create department", async () => {
            req.body = { name: "HR" };
            adminService.createDepartment.mockResolvedValue(req.body);


            await adminController.createDepartment(req, res);

            expect(adminService.createDepartment).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(req.body);
        });

        it("should handle errors", async () => {
            adminService.createDepartment.mockRejectedValue(new Error("Fail"));
            await adminController.createDepartment(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Fail" });
        });

    });
});
