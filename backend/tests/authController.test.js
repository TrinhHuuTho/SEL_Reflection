const request = require("supertest");
const express = require("express");
const authController = require("../controllers/authController");

// Mock User model
jest.mock("../models/User");
const User = require("../models/User");

// Tạo Express app test
const app = express();
app.use(express.json());
app.post("/api/auth/login", authController.login);

describe("AuthController - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Nên trả về lỗi 400 khi thiếu email hoặc password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" }); // Thiếu password

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("email và mật khẩu");
  });

  test("Nên trả về lỗi 401 khi email không tồn tại", async () => {
    User.findOne.mockResolvedValue(null); // User không tồn tại

    const response = await request(app).post("/api/auth/login").send({
      email: "notfound@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("không đúng");
  });

  test("Nên trả về lỗi 401 khi mật khẩu sai", async () => {
    const mockUser = {
      email: "test@example.com",
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(false), // Password không khớp
    };
    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("Nên trả về lỗi 403 khi tài khoản bị vô hiệu hóa", async () => {
    const mockUser = {
      email: "test@example.com",
      isActive: false, // Tài khoản bị khóa
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "correctpassword",
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("vô hiệu hóa");
  });
});
