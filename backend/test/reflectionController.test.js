const reflectionController = require("../controllers/reflectionController");
const Reflection = require("../models/Reflection");
const Node = require("../models/Node");
const StudentProgress = require("../models/StudentProgress");

jest.mock("../models/Reflection", () => {
  const ReflectionModel = jest.fn();
  ReflectionModel.find = jest.fn();
  ReflectionModel.findById = jest.fn();
  return ReflectionModel;
});

jest.mock("../models/Node", () => ({
  findById: jest.fn(),
}));

jest.mock("../models/StudentProgress", () => {
  const StudentProgressModel = jest.fn();
  StudentProgressModel.findOne = jest.fn();
  return StudentProgressModel;
});

const VALID_REFLECTION_ID = "507f1f77bcf86cd799439011";
const VALID_NODE_ID = "507f1f77bcf86cd799439015";
const VALID_QUESTION_ID = "507f1f77bcf86cd799439016";
const OWNER_ID = "507f1f77bcf86cd799439012";
const OTHER_USER_ID = "507f1f77bcf86cd799439013";

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Reflection Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Node.findById.mockResolvedValue(null);
    StudentProgress.findOne.mockResolvedValue(null);
  });

  test("createReflection should return 201 for valid payload", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);

    Reflection.mockImplementation(function mockReflection(data) {
      Object.assign(this, data);
      this._id = VALID_REFLECTION_ID;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.save = saveMock;
    });

    const req = {
      user: { id: OWNER_ID },
      body: {
        nodeId: VALID_NODE_ID,
        questionId: VALID_QUESTION_ID,
        content: "Noi dung reflection hop le lon hon 10 ky tu",
        emotion: "happy",
        character: "cat",
        isPrivate: false,
      },
    };
    const res = createResponse();

    await reflectionController.createReflection(req, res);

    expect(Reflection).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Tao reflection thanh cong",
      }),
    );
  });

  test("createReflection should return 400 when required fields are missing", async () => {
    const req = {
      user: { id: OWNER_ID },
      body: {
        content: "",
      },
    };
    const res = createResponse();

    await reflectionController.createReflection(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("createReflection should return 409 for duplicate key error", async () => {
    const saveMock = jest.fn().mockRejectedValue({ code: 11000 });

    Reflection.mockImplementation(function mockReflection(data) {
      Object.assign(this, data);
      this._id = VALID_REFLECTION_ID;
      this.save = saveMock;
    });

    const req = {
      user: { id: OWNER_ID },
      body: {
        nodeId: VALID_NODE_ID,
        questionId: VALID_QUESTION_ID,
        content: "Noi dung trung lap cua student va node",
      },
    };
    const res = createResponse();

    await reflectionController.createReflection(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("getReflectionsByNode should return own and peer reflections", async () => {
    const ownReflection = {
      _id: VALID_REFLECTION_ID,
      studentId: {
        _id: OWNER_ID,
        full_name: "Owner User",
        avatar: "owner.png",
        role: "user",
      },
      nodeId: VALID_NODE_ID,
      content: "Noi dung owner hop le",
      emotion: "happy",
      isPrivate: false,
      character: "cat",
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const peerReflection = {
      _id: "507f1f77bcf86cd799439014",
      studentId: {
        _id: OTHER_USER_ID,
        full_name: "Peer User",
        avatar: "peer.png",
        role: "user",
      },
      nodeId: VALID_NODE_ID,
      content: "Noi dung peer hop le",
      emotion: "neutral",
      isPrivate: false,
      character: "dog",
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const populateMock = jest
      .fn()
      .mockResolvedValue([ownReflection, peerReflection]);
    const sortMock = jest.fn().mockReturnValue({ populate: populateMock });
    Reflection.find.mockReturnValue({ sort: sortMock });

    const req = {
      user: { id: OWNER_ID },
      params: {
        nodeId: VALID_NODE_ID,
      },
    };
    const res = createResponse();

    await reflectionController.getReflectionsByNode(req, res);

    expect(Reflection.find).toHaveBeenCalledWith({ nodeId: VALID_NODE_ID });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          ownReflection: expect.objectContaining({ studentId: OWNER_ID }),
          peerReflections: expect.arrayContaining([
            expect.objectContaining({ studentId: OTHER_USER_ID }),
          ]),
        }),
      }),
    );
  });

  test("updateReflectionById should return 403 when user is not owner", async () => {
    Reflection.findById.mockResolvedValue({
      _id: VALID_REFLECTION_ID,
      studentId: OTHER_USER_ID,
      content: "Noi dung hien tai hop le",
      save: jest.fn(),
    });

    const req = {
      user: { id: OWNER_ID },
      params: { id: VALID_REFLECTION_ID },
      body: { content: "Noi dung cap nhat moi hop le hon" },
    };
    const res = createResponse();

    await reflectionController.updateReflectionById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  test("updateReflectionById should return 200 for owner update", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const reflectionDoc = {
      _id: VALID_REFLECTION_ID,
      studentId: OWNER_ID,
      nodeId: VALID_NODE_ID,
      content: "Noi dung cu hop le",
      emotion: "neutral",
      isPrivate: false,
      character: "cat",
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };

    Reflection.findById.mockResolvedValue(reflectionDoc);

    const req = {
      user: { id: OWNER_ID },
      params: { id: VALID_REFLECTION_ID },
      body: {
        content: "Noi dung da duoc cap nhat va van hop le",
        isPrivate: true,
      },
    };
    const res = createResponse();

    await reflectionController.updateReflectionById(req, res);

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(reflectionDoc.content).toBe(
      "Noi dung da duoc cap nhat va van hop le",
    );
    expect(reflectionDoc.isPrivate).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteReflectionById should return 200 for owner delete", async () => {
    const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });

    Reflection.findById.mockResolvedValue({
      _id: VALID_REFLECTION_ID,
      studentId: OWNER_ID,
      deleteOne: deleteOneMock,
    });

    const req = {
      user: { id: OWNER_ID },
      params: { id: VALID_REFLECTION_ID },
    };
    const res = createResponse();

    await reflectionController.deleteReflectionById(req, res);

    expect(deleteOneMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
