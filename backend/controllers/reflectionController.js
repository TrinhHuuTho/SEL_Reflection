const mongoose = require("mongoose");
const Reflection = require("../models/Reflection");

const EMOTION_VALUES = ["happy", "sad", "neutral", "confused", "angry"];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const getReflectionOwnerId = (reflection) => {
  if (!reflection?.studentId) {
    return null;
  }

  if (typeof reflection.studentId === "string") {
    return reflection.studentId;
  }

  if (reflection.studentId._id) {
    return reflection.studentId._id.toString();
  }

  return reflection.studentId.toString();
};

const serializeReflection = (reflection) => {
  if (!reflection) {
    return null;
  }

  const ownerId = getReflectionOwnerId(reflection);
  const hasAuthorObject =
    reflection.studentId &&
    typeof reflection.studentId === "object" &&
    reflection.studentId._id;

  return {
    id: reflection._id,
    studentId: ownerId,
    nodeId: reflection.nodeId,
    content: reflection.content,
    emotion: reflection.emotion,
    character: reflection.character,
    isPrivate: reflection.isPrivate,
    version: reflection.version,
    createdAt: reflection.createdAt,
    updatedAt: reflection.updatedAt,
    author: hasAuthorObject
      ? {
          id: reflection.studentId._id,
          full_name: reflection.studentId.full_name,
          avatar: reflection.studentId.avatar,
          role: reflection.studentId.role,
        }
      : null,
  };
};

exports.createReflection = async (req, res) => {
  try {
    const nodeId = normalizeString(req.body.nodeId);
    const content = normalizeString(req.body.content);
    const emotion = normalizeString(req.body.emotion);
    const character = normalizeString(req.body.character);
    const isPrivate =
      req.body.isPrivate !== undefined ? Boolean(req.body.isPrivate) : false;

    if (!nodeId || !content) {
      return res.status(400).json({
        success: false,
        message: "nodeId va content la bat buoc",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(nodeId)) {
      return res.status(400).json({
        success: false,
        message: "nodeId khong hop le",
      });
    }

    if (content.length < 10 || content.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Noi dung reflection phai tu 10 den 500 ky tu",
      });
    }

    if (emotion && !EMOTION_VALUES.includes(emotion)) {
      return res.status(400).json({
        success: false,
        message: `emotion khong hop le. Cho phep: ${EMOTION_VALUES.join(", ")}`,
      });
    }

    const reflection = new Reflection({
      studentId: req.user.id,
      nodeId,
      content,
      emotion: emotion || null,
      character: character || null,
      isPrivate,
    });

    await reflection.save();

    return res.status(201).json({
      success: true,
      message: "Tao reflection thanh cong",
      data: serializeReflection(reflection),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Reflection cho node nay da ton tai. Hay dung API cap nhat.",
      });
    }

    console.error("Create reflection error:", error);
    return res.status(500).json({
      success: false,
      message: "Loi khi tao reflection",
      error: error.message,
    });
  }
};

exports.getReflectionsByNode = async (req, res) => {
  try {
    const nodeId = normalizeString(req.params.nodeId);

    if (!nodeId || !mongoose.Types.ObjectId.isValid(nodeId)) {
      return res.status(400).json({
        success: false,
        message: "nodeId khong hop le",
      });
    }

    const reflections = await Reflection.find({ nodeId })
      .sort({ updatedAt: -1 })
      .populate("studentId", "full_name avatar role");

    const ownReflection =
      reflections.find((item) => getReflectionOwnerId(item) === req.user.id) ||
      null;
    const peerReflections = reflections.filter(
      (item) => getReflectionOwnerId(item) !== req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Lay danh sach reflection thanh cong",
      data: {
        ownReflection: serializeReflection(ownReflection),
        peerReflections: peerReflections.map(serializeReflection),
        total: reflections.length,
      },
    });
  } catch (error) {
    console.error("Get reflections by node error:", error);
    return res.status(500).json({
      success: false,
      message: "Loi khi lay danh sach reflection",
      error: error.message,
    });
  }
};

exports.updateReflectionById = async (req, res) => {
  try {
    const reflectionId = normalizeString(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        message: "reflection id khong hop le",
      });
    }

    const reflection = await Reflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay reflection",
      });
    }

    if (getReflectionOwnerId(reflection) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Ban chi co the cap nhat reflection cua chinh minh",
      });
    }

    const nextContent =
      req.body.content !== undefined ? normalizeString(req.body.content) : null;
    const nextEmotion =
      req.body.emotion !== undefined ? normalizeString(req.body.emotion) : null;
    const nextCharacter =
      req.body.character !== undefined
        ? normalizeString(req.body.character)
        : null;
    const nextIsPrivate =
      req.body.isPrivate !== undefined ? Boolean(req.body.isPrivate) : null;

    if (nextContent !== null) {
      if (!nextContent || nextContent.length < 10 || nextContent.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Noi dung reflection phai tu 10 den 500 ky tu",
        });
      }

      reflection.content = nextContent;
    }

    if (nextEmotion !== null) {
      if (nextEmotion && !EMOTION_VALUES.includes(nextEmotion)) {
        return res.status(400).json({
          success: false,
          message: `emotion khong hop le. Cho phep: ${EMOTION_VALUES.join(", ")}`,
        });
      }

      reflection.emotion = nextEmotion || null;
    }

    if (nextCharacter !== null) {
      reflection.character = nextCharacter || null;
    }

    if (nextIsPrivate !== null) {
      reflection.isPrivate = nextIsPrivate;
    }

    if (
      nextContent === null &&
      nextEmotion === null &&
      nextCharacter === null &&
      nextIsPrivate === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Khong co truong hop le de cap nhat",
      });
    }

    reflection.version = (reflection.version || 0) + 1;

    await reflection.save();

    return res.status(200).json({
      success: true,
      message: "Cap nhat reflection thanh cong",
      data: serializeReflection(reflection),
    });
  } catch (error) {
    console.error("Update reflection error:", error);
    return res.status(500).json({
      success: false,
      message: "Loi khi cap nhat reflection",
      error: error.message,
    });
  }
};

exports.deleteReflectionById = async (req, res) => {
  try {
    const reflectionId = normalizeString(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        message: "reflection id khong hop le",
      });
    }

    const reflection = await Reflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay reflection",
      });
    }

    if (getReflectionOwnerId(reflection) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Ban chi co the xoa reflection cua chinh minh",
      });
    }

    await reflection.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xoa reflection thanh cong",
    });
  } catch (error) {
    console.error("Delete reflection error:", error);
    return res.status(500).json({
      success: false,
      message: "Loi khi xoa reflection",
      error: error.message,
    });
  }
};
