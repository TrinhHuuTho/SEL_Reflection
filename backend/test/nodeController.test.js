const mongoose = require("mongoose");
const nodeController = require("../controllers/nodeController");
const Node = require("../models/Node");

jest.mock("../models/Node", () => {
  const NodeModel = jest.fn();
  NodeModel.find = jest.fn();
  NodeModel.findById = jest.fn();
  return NodeModel;
});

const VALID_NODE_ID = "507f1f77bcf86cd799439011";
const VALID_COURSE_ID = "507f1f77bcf86cd799439012";

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Node Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getNodes ────────────────────────────────────────────────────────────────

  test("getNodes should return 200 with list of nodes", async () => {
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

    const req = { query: {} };
    const res = createResponse();

    await nodeController.getNodes(req, res);

    expect(Node.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  test("getNodes should filter by courseId when provided", async () => {
    const sortMock = jest.fn().mockResolvedValue([]);
    Node.find.mockReturnValue({ sort: sortMock });

    const req = { query: { courseId: VALID_COURSE_ID } };
    const res = createResponse();

    await nodeController.getNodes(req, res);

    expect(Node.find).toHaveBeenCalledWith({ courseId: VALID_COURSE_ID });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getNodes should return 400 for invalid courseId", async () => {
    const req = { query: { courseId: "invalid-id" } };
    const res = createResponse();

    await nodeController.getNodes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  // ─── getNodeById ─────────────────────────────────────────────────────────────

  test("getNodeById should return 200 for valid id", async () => {
    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      courseId: VALID_COURSE_ID,
      title: "Day 1",
      order: 1,
    });

    const req = { params: { id: VALID_NODE_ID } };
    const res = createResponse();

    await nodeController.getNodeById(req, res);

    expect(Node.findById).toHaveBeenCalledWith(VALID_NODE_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  test("getNodeById should return 400 for invalid id format", async () => {
    const req = { params: { id: "not-an-objectid" } };
    const res = createResponse();

    await nodeController.getNodeById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("getNodeById should return 404 when node not found", async () => {
    Node.findById.mockResolvedValue(null);

    const req = { params: { id: VALID_NODE_ID } };
    const res = createResponse();

    await nodeController.getNodeById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  // ─── createNode ──────────────────────────────────────────────────────────────

  test("createNode should return 201 for valid payload", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);

    Node.mockImplementation(function mockNode(data) {
      Object.assign(this, data);
      this._id = VALID_NODE_ID;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.save = saveMock;
    });

    const req = {
      body: {
        courseId: VALID_COURSE_ID,
        title: "Day 1",
        order: 1,
        positionX: 100,
        positionY: 200,
        description: "Noi dung buoi hoc dau tien",
        isOpen: true,
      },
    };
    const res = createResponse();

    await nodeController.createNode(req, res);

    expect(Node).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Tạo node thành công",
      }),
    );
  });

  test("createNode should return 400 when required fields are missing", async () => {
    const req = {
      body: {
        courseId: VALID_COURSE_ID,
        // thiếu title và order
      },
    };
    const res = createResponse();

    await nodeController.createNode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("createNode should return 400 for invalid courseId", async () => {
    const req = {
      body: {
        courseId: "invalid-id",
        title: "Day 1",
        order: 1,
      },
    };
    const res = createResponse();

    await nodeController.createNode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("createNode should return 409 for duplicate order in course", async () => {
    const saveMock = jest.fn().mockRejectedValue({ code: 11000 });

    Node.mockImplementation(function mockNode(data) {
      Object.assign(this, data);
      this._id = VALID_NODE_ID;
      this.save = saveMock;
    });

    const req = {
      body: { courseId: VALID_COURSE_ID, title: "Day 1", order: 1 },
    };
    const res = createResponse();

    await nodeController.createNode(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  // ─── updateNode ──────────────────────────────────────────────────────────────

  test("updateNode should return 200 for valid update", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const nodeDoc = {
      _id: VALID_NODE_ID,
      courseId: VALID_COURSE_ID,
      title: "Day 1",
      order: 1,
      isOpen: false,
      save: saveMock,
    };

    Node.findById.mockResolvedValue(nodeDoc);

    const req = {
      params: { id: VALID_NODE_ID },
      body: { title: "Day 1 Updated", isOpen: true },
    };
    const res = createResponse();

    await nodeController.updateNode(req, res);

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(nodeDoc.title).toBe("Day 1 Updated");
    expect(nodeDoc.isOpen).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateNode should return 404 when node not found", async () => {
    Node.findById.mockResolvedValue(null);

    const req = {
      params: { id: VALID_NODE_ID },
      body: { title: "Updated" },
    };
    const res = createResponse();

    await nodeController.updateNode(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("updateNode should return 400 for invalid id format", async () => {
    const req = {
      params: { id: "bad-id" },
      body: { title: "Updated" },
    };
    const res = createResponse();

    await nodeController.updateNode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ─── deleteNode ──────────────────────────────────────────────────────────────

  test("deleteNode should return 200 for valid delete", async () => {
    const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });

    Node.findById.mockResolvedValue({
      _id: VALID_NODE_ID,
      deleteOne: deleteOneMock,
    });

    const req = { params: { id: VALID_NODE_ID } };
    const res = createResponse();

    await nodeController.deleteNode(req, res);

    expect(deleteOneMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  test("deleteNode should return 404 when node not found", async () => {
    Node.findById.mockResolvedValue(null);

    const req = { params: { id: VALID_NODE_ID } };
    const res = createResponse();

    await nodeController.deleteNode(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("deleteNode should return 400 for invalid id format", async () => {
    const req = { params: { id: "bad-id" } };
    const res = createResponse();

    await nodeController.deleteNode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
