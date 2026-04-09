const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const nodeRoutes = require("../routes/node");
const Node = require("../models/Node");

jest.mock("../models/Node", () => {
  const NodeModel = jest.fn();
  NodeModel.find = jest.fn();
  NodeModel.findById = jest.fn();
  return NodeModel;
});

const VALID_NODE_ID = "507f1f77bcf86cd799439011";
const VALID_COURSE_ID = "507f1f77bcf86cd799439012";
const TEACHER_ID = "507f1f77bcf86cd799439013";
const STUDENT_ID = "507f1f77bcf86cd799439014";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/nodes", nodeRoutes);
  return app;
};

const signToken = (userId, role = "teacher") =>
  jwt.sign(
    { id: userId, email: "test@example.com", role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" },
  );

describe("Node Routes", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "node-route-test-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();

    Node.mockImplementation(function mockNode(data) {
      Object.assign(this, data);
      this._id = VALID_NODE_ID;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.save = jest.fn().mockResolvedValue(undefined);
      this.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    });
  });

  // ─── GET /nodes ──────────────────────────────────────────────────────────────

  test("GET /nodes should require authorization token", async () => {
    const app = buildApp();

    const response = await request(app).get("/nodes");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("GET /nodes should return 200 for authenticated user", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID);
    const sortMock = jest.fn().mockResolvedValue([]);
    Node.find.mockReturnValue({ sort: sortMock });

    const response = await request(app)
      .get("/nodes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("GET /nodes?courseId= should return 200 with valid courseId", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID);
    const sortMock = jest
      .fn()
      .mockResolvedValue([
        {
          _id: VALID_NODE_ID,
          courseId: VALID_COURSE_ID,
          title: "Day 1",
          order: 1,
        },
      ]);
    Node.find.mockReturnValue({ sort: sortMock });

    const response = await request(app)
      .get(`/nodes?courseId=${VALID_COURSE_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // ─── GET /nodes/:id ──────────────────────────────────────────────────────────

  test("GET /nodes/:id should return 200 for existing node", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID);
    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      courseId: VALID_COURSE_ID,
      title: "Day 1",
      order: 1,
    });

    const response = await request(app)
      .get(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("GET /nodes/:id should return 404 when node not found", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID);
    Node.findById.mockResolvedValue(null);

    const response = await request(app)
      .get(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ─── POST /nodes ─────────────────────────────────────────────────────────────

  test("POST /nodes should require authorization token", async () => {
    const app = buildApp();

    const response = await request(app)
      .post("/nodes")
      .send({ courseId: VALID_COURSE_ID, title: "Day 1", order: 1 });

    expect(response.status).toBe(401);
  });

  test("POST /nodes should allow student role with valid payload", async () => {
    const app = buildApp();
    const token = signToken(STUDENT_ID, "student");

    const response = await request(app)
      .post("/nodes")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: VALID_COURSE_ID, title: "Day 1", order: 1 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test("POST /nodes should return 201 for teacher with valid payload", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID, "teacher");

    const response = await request(app)
      .post("/nodes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        courseId: VALID_COURSE_ID,
        title: "Day 1",
        order: 1,
        description: "Noi dung buoi hoc",
        isOpen: false,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test("POST /nodes should return 400 when required fields are missing", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID, "teacher");

    const response = await request(app)
      .post("/nodes")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: VALID_COURSE_ID });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // ─── PUT /nodes/:id ──────────────────────────────────────────────────────────

  test("PUT /nodes/:id should allow student update", async () => {
    const app = buildApp();
    const token = signToken(STUDENT_ID, "student");
    const saveMock = jest.fn().mockResolvedValue(undefined);

    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      courseId: VALID_COURSE_ID,
      title: "Day 1",
      order: 1,
      save: saveMock,
    });

    const response = await request(app)
      .put(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated" });

    expect(response.status).toBe(200);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  test("PUT /nodes/:id should return 200 for teacher update", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID, "teacher");
    const saveMock = jest.fn().mockResolvedValue(undefined);

    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      courseId: VALID_COURSE_ID,
      title: "Day 1",
      order: 1,
      isOpen: false,
      save: saveMock,
    });

    const response = await request(app)
      .put(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Day 1 Updated", isOpen: true });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  // ─── DELETE /nodes/:id ───────────────────────────────────────────────────────

  test("DELETE /nodes/:id should allow student delete", async () => {
    const app = buildApp();
    const token = signToken(STUDENT_ID, "student");
    const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });

    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      deleteOne: deleteOneMock,
    });

    const response = await request(app)
      .delete(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(deleteOneMock).toHaveBeenCalledTimes(1);
  });

  test("DELETE /nodes/:id should return 200 for teacher delete", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID, "teacher");
    const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });

    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      deleteOne: deleteOneMock,
    });

    const response = await request(app)
      .delete(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(deleteOneMock).toHaveBeenCalledTimes(1);
  });

  test("DELETE /nodes/:id should return 404 when node not found", async () => {
    const app = buildApp();
    const token = signToken(TEACHER_ID, "teacher");
    Node.findById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/nodes/${VALID_NODE_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
