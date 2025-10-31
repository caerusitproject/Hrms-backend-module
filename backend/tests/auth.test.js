const authController = require("../src/controllers/authController");
const authservice = require("../src/services/authService");
const empService = require("../src/services/employeeService");

// ✅ Mock all service methods used in authController
jest.mock("../src/services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  verifyRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  findUserById: jest.fn(),
  generateNewrefreshtoken: jest.fn(),
}));

jest.mock("../src/services/employeeService", () => ({
  getEmployeeDetailsById: jest.fn(),
}));

describe("AuthController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ------------------------------
  // REGISTER
  // ------------------------------
  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "secret",
        roleId: 2,
      };
      const mockUser = { id: 1, email: "john@example.com" };
      authservice.registerUser.mockResolvedValue(mockUser);

      await authController.register(req, res);

      expect(authservice.registerUser).toHaveBeenCalledWith(
        "John Doe",
        "johndoe",
        "john@example.com",
        "secret",
        2
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        user: mockUser,
      });
    });

    it("should handle registration errors", async () => {
      const error = new Error("Email already exists");
      authservice.registerUser.mockRejectedValue(error);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
    });
  });

  // ------------------------------
  // LOGIN
  // ------------------------------
  describe("login", () => {
    it("should login user and return tokens", async () => {
      req.body = { email: "john@example.com", password: "secret" };
      const mockResponse = {
        accessToken: "access123",
        refreshToken: "refresh456",
        userData: { id: 1, email: "john@example.com" },
      };
      authservice.loginUser.mockResolvedValue(mockResponse);

      await authController.login(req, res);

      expect(authservice.loginUser).toHaveBeenCalledWith(
        "john@example.com",
        "secret"
      );
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle login errors", async () => {
      const error = new Error("Invalid credentials");
      authservice.loginUser.mockRejectedValue(error);
      req.body = { email: "john@example.com", password: "wrong" };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });
  });

  // ------------------------------
  // REFRESH
  // ------------------------------
  describe("refresh", () => {
    it("should return 400 if refresh token is missing", async () => {
      req.body = {};

      await authController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Refresh token required" });
    });

    it("should return 403 if refresh token expired", async () => {
      req.body = { refreshToken: "expired-token" };
      authservice.verifyRefreshToken.mockResolvedValue(false);

      await authController.refresh(req, res);

      expect(authservice.verifyRefreshToken).toHaveBeenCalledWith("expired-token");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Refresh token was expired. Please make a new signin request",
      });
    });

    it("should refresh tokens successfully for employee", async () => {
      req.body = { refreshToken: "valid-token" };
      authservice.verifyRefreshToken.mockResolvedValue(true);
      authservice.findRefreshToken.mockResolvedValue({ id: 10, empId: 5 });

      empService.getEmployeeDetailsById.mockResolvedValue({
        id: 5,
        email: "emp@example.com",
        roles: [{ role: "EMPLOYEE" }],
      });

      authservice.generateNewrefreshtoken.mockResolvedValue({
        newAccessToken: "new-access",
        newRefreshToken: "new-refresh",
      });

      await authController.refresh(req, res);

      expect(authservice.findRefreshToken).toHaveBeenCalledWith("valid-token");
      expect(empService.getEmployeeDetailsById).toHaveBeenCalledWith(5);
      expect(authservice.generateNewrefreshtoken).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "new-access",
        refreshToken: "new-refresh",
      });
    });

    it("should refresh tokens successfully for normal user", async () => {
      req.body = { refreshToken: "valid-user-token" };
      authservice.verifyRefreshToken.mockResolvedValue(true);
      authservice.findRefreshToken.mockResolvedValue({ id: 22, userId: 9 });

      authservice.findUserById.mockResolvedValue({
        id: 9,
        email: "user@example.com",
        role: "USER",
      });

      authservice.generateNewrefreshtoken.mockResolvedValue({
        newAccessToken: "tokenA",
        newRefreshToken: "tokenB",
      });

      await authController.refresh(req, res);

      expect(authservice.findUserById).toHaveBeenCalledWith(9);
      expect(authservice.generateNewrefreshtoken).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "tokenA",
        refreshToken: "tokenB",
      });
    });

    it("should handle refresh token errors", async () => {
      req.body = { refreshToken: "invalid" };
      const error = new Error("Invalid token");
      authservice.verifyRefreshToken.mockRejectedValue(error);

      await authController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    });
  });
});
