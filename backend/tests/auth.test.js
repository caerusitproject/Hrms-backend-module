const authController = require('../src/controllers/authcontroller')
const authService = require("../src/services/authService");
const empService = require("../src/services/employeeService");

// ✅ Mock dependencies
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
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ---------------------------------------
  // 🔹 register()
  // ---------------------------------------
  describe("register", () => {
    it("should register user successfully", async () => {
      req.body = {
        fullname: "John Doe",
        username: "john",
        email: "john@example.com",
        password: "secret",
        roleId: 2,
      };
      const mockUser = { id: 1, ...req.body };
      authService.registerUser.mockResolvedValue(mockUser);

      await authController.register(req, res);

      expect(authService.registerUser).toHaveBeenCalledWith(
        "John Doe",
        "john",
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
      expect(res.json).toHaveBeenCalledWith({ error:400, message: "Email already exists" });
    });
  });

  // ---------------------------------------
  // 🔹 login()
  // ---------------------------------------
  describe("login", () => {
    it("should login successfully and return tokens", async () => {
      req.body = { email: "john@example.com", password: "secret" };
      const mockResponse = {
        accessToken: "access123",
        refreshToken: "refresh123",
        userData: { id: 1, email: "john@example.com" },
      };
      authService.loginUser.mockResolvedValue(mockResponse);

      await authController.login(req, res);

      expect(authService.loginUser).toHaveBeenCalledWith(
        "john@example.com",
        "secret"
      );
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 401 on invalid credentials", async () => {
      const error = new Error("Invalid email or password");
      authService.loginUser.mockRejectedValue(error);

      req.body = { email: "wrong@example.com", password: "badpass" };
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });
  });

  // ---------------------------------------
  // 🔹 refresh()
  // ---------------------------------------
  describe("refresh", () => {
  it("should return 400 if refresh token is missing", async () => {
    req.body = {};
    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Refresh token required",
    });
  });

  it("should return 403 if refresh token expired", async () => {
    req.body = { refreshToken: "expired-token" };
    authService.verifyRefreshToken.mockResolvedValue(false);

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Refresh token was expired. Please make a new signin request",
    });
  });

  it("should refresh tokens successfully for employee", async () => {
    req.body = { refreshToken: "valid-token" };

    authService.verifyRefreshToken.mockResolvedValue(true);
    authService.findRefreshToken.mockResolvedValue({ id: 10, empId: 5 });

    // ✅ Updated here
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

    // ✅ Updated here
    expect(empService.getEmployeeById).toHaveBeenCalledWith(5);

    expect(authService.generateNewrefreshtoken).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
  });

  it("should refresh tokens successfully for normal user", async () => {
    req.body = { refreshToken: "valid-user-token" };

    authService.verifyRefreshToken.mockResolvedValue(true);
    authService.findRefreshToken.mockResolvedValue({ id: 7, userId: 2 });
    authService.findUserById.mockResolvedValue({
      id: 2,
      email: "user@example.com",
      roles: [{ role: "USER" }],
    });
    authService.generateNewrefreshtoken.mockResolvedValue({
      newAccessToken: "new-access",
      newRefreshToken: "new-refresh",
    });

    await authController.refresh(req, res);

    expect(authService.findUserById).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
  });

  it("should handle unexpected errors gracefully", async () => {
    req.body = { refreshToken: "token" };
    const error = new Error("Unexpected DB error");
    authService.verifyRefreshToken.mockRejectedValue(error);

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unexpected DB error" });
  });
});

});
