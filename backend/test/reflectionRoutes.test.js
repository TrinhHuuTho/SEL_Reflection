const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const reflectionRoutes = require("../routes/reflection");
const Reflection = require("../models/Reflection");

jest.mock("../models/Reflection", () => {
  const ReflectionModel = jest.fn();
  ReflectionModel.find = jest.fn();
  ReflectionModel.findById = jest.fn();
  return ReflectionModel;
});

const VALID_REFLECTION_ID = "507f1f77bcf86cd799439011";
const VALID_NODE_ID = "507f1f77bcf86cd799439015";
const OWNER_ID = "507f1f77bcf86cd799439012";
const OTHER_USER_ID = "507f1f77bcf86cd799439013";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/reflections", reflectionRoutes);
  return app;
};

const signToken = (userId) =>
  jwt.sign(
    { id: userId, email: "test@example.com", role: "user" },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" },
  );

describe("Reflection Routes", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "reflection-route-test-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();

    Reflection.mockImplementation(function mockReflection(data) {
      Object.assign(this, data);
      this._id = VALID_REFLECTION_ID;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.save = jest.fn().mockResolvedValue(undefined);
      this.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    });
  });

  test("POST /reflections should require authorization token", async () => {
    const app = buildApp();

    const response = await request(app).post("/reflections").send({
      nodeId: VALID_NODE_ID,
      content: "Noi dung reflection hop le hon 10 ky tu",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("PATCH /reflections/:id should allow owner update", async () => {
    const app = buildApp();
    const token = signToken(OWNER_ID);
    const saveMock = jest.fn().mockResolvedValue(undefined);

    Reflection.findById.mockResolvedValue({
      _id: VALID_REFLECTION_ID,
      studentId: OWNER_ID,
      nodeId: VALID_NODE_ID,
      content: "Noi dung cu hop le",
      emotion: "neutral",
      isPrivate: false,
      character: "cat",
      version: 0,
      save: saveMock,
    });

    const response = await request(app)
      .patch(`/reflections/${VALID_REFLECTION_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Noi dung cap nhat hop le va dai hon 10 ky tu" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  test("PATCH /reflections/:id should reject non-owner update", async () => {
    const app = buildApp();
    const token = signToken(OWNER_ID);

    Reflection.findById.mockResolvedValue({
      _id: VALID_REFLECTION_ID,
      studentId: OTHER_USER_ID,
      content: "Noi dung cu hop le",
      save: jest.fn(),
    });

    const response = await request(app)
      .patch(`/reflections/${VALID_REFLECTION_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Noi dung cap nhat hop le va dai hon 10 ky tu" });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test("DELETE /reflections/:id should allow owner delete", async () => {
    const app = buildApp();
    const token = signToken(OWNER_ID);
    const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });

    Reflection.findById.mockResolvedValue({
      _id: VALID_REFLECTION_ID,
      studentId: OWNER_ID,
      deleteOne: deleteOneMock,
    });

    const response = await request(app)
      .delete(`/reflections/${VALID_REFLECTION_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(deleteOneMock).toHaveBeenCalledTimes(1);
  });

  test("DELETE /reflections/:id should reject non-owner delete", async () => {
    const app = buildApp();
    const token = signToken(OWNER_ID);

    Reflection.findById.mockResolvedValue({
      _id: VALID_REFLECTION_ID,
      studentId: OTHER_USER_ID,
      deleteOne: jest.fn(),
    });

    const response = await request(app)
      .delete(`/reflections/${VALID_REFLECTION_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
