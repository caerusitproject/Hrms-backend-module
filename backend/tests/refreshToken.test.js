const request = require('supertest');
const authController = require('../src/controllers/authcontroller')
const empService = require("../src/services/employeeService");


const authService = require("../src/services/authService");


// ✅ Explicit Jest mocks
jest.mock("../src/services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  verifyRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  findUserById: jest.fn(),
  generateNewrefreshtoken: jest.fn(),
}));

jest.mock("../src/services/employeeService", () => ({
  getEmployeeById: jest.fn(),
}));

describe("Auth Controller", () => {
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
    it("should register a user successfully", async () => {
      req.body = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "secret",
        roleId: 2,
      };
      const mockUser = { id: 1, email: "john@example.com" };
      authService.registerUser.mockResolvedValue(mockUser);

      await authController.register(req, res);

      expect(authService.registerUser).toHaveBeenCalledWith(
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
      authService.registerUser.mockRejectedValue(error);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({error:400, message: "Email already exists" });
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
      authService.loginUser.mockResolvedValue(mockResponse);

      await authController.login(req, res);

      expect(authService.loginUser).toHaveBeenCalledWith("john@example.com", "secret");
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle login errors", async () => {
      const error = new Error("Invalid credentials");
      authService.loginUser.mockRejectedValue(error);
      req.body = { email: "john@example.com", password: "wrong" };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });
  });

  // ------------------------------
  // REFRESH TOKEN
  // ------------------------------
  describe("refresh", () => {
  it("should return 400 if refresh token is missing", async () => {
    req.body = {};
    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Refresh token required" });
  });

  it("should return 403 if user refresh token expired", async () => {
    req.body = { refreshToken: "expired-token" };
    authService.verifyRefreshToken.mockResolvedValue(false);

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Refresh token was expired. Please make a new signin request",
    });
  });

  it("should refresh tokens successfully for employee", async () => {
    req.body = { refreshToken: "valid-token" };

    authService.verifyRefreshToken.mockResolvedValue(true);
    authService.findRefreshToken.mockResolvedValue({ id: 10, empId: 5 });

    // ✅ UPDATED to getEmployeeById
    empService.getEmployeeById.mockResolvedValue({
      id: 5,
      email: "emp@example.com",
      roles: [{ role: "EMPLOYEE" }],
    });

    authService.generateNewrefreshtoken.mockResolvedValue({
      newAccessToken: "new-access",
      newRefreshToken: "new-refresh",
    });

    await authController.refresh(req, res);

    expect(authService.verifyRefreshToken).toHaveBeenCalledWith("valid-token");
    expect(authService.findRefreshToken).toHaveBeenCalledWith("valid-token");

    // ✅ UPDATED HERE
    expect(empService.getEmployeeById).toHaveBeenCalledWith(5);

    expect(authService.generateNewrefreshtoken).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
  });

  it("should refresh tokens successfully for non-employee user", async () => {
    req.body = { refreshToken: "valid-user-token" };

    authService.verifyRefreshToken.mockResolvedValue(true);
    authService.findRefreshToken.mockResolvedValue({ id: 22, userId: 9 });
    authService.findUserById.mockResolvedValue({
      id: 9,
      email: "user@example.com",
    });

    authService.generateNewrefreshtoken.mockResolvedValue({
      newAccessToken: "tokenA",
      newRefreshToken: "tokenB",
    });

    await authController.refresh(req, res);

    expect(authService.findUserById).toHaveBeenCalledWith(9);
    expect(authService.generateNewrefreshtoken).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "tokenA",
      refreshToken: "tokenB",
    });
  });

  it("should handle refresh token errors", async () => {
    req.body = { refreshToken: "invalid" };
    const error = new Error("Invalid token");

    authService.verifyRefreshToken.mockRejectedValue(error);

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });
});

});
