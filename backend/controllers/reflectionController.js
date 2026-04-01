const mongoose = require("mongoose");
const Reflection = require("../models/Reflection");
const Node = require("../models/Node");
const StudentProgress = require("../models/StudentProgress");

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
    questionId: reflection.questionId,
    content: reflection.content,
    isPrivate: reflection.isPrivate,
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
    const questionId = normalizeString(req.body.questionId);
    const content = normalizeString(req.body.content);
    const isPrivate =
      req.body.isPrivate !== undefined ? Boolean(req.body.isPrivate) : false;

    if (!nodeId || !questionId || !content) {
      return res.status(400).json({
        success: false,
        message: "nodeId, questionId va content la bat buoc",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(nodeId) || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "nodeId hoac questionId khong hop le",
      });
    }

    if (content.length < 10 || content.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Noi dung reflection phai tu 10 den 500 ky tu",
      });
    }

    const reflection = new Reflection({
      studentId: req.user.id,
      nodeId,
      questionId,
      content,
      isPrivate,
    });

    await reflection.save();

    // --- BẮT ĐẦU: LOGIC AUTO-UPDATE TIẾN ĐỘ HỌC TẬP TỰ ĐỘNG ---
    try {
      const node = await Node.findById(nodeId);
      if (node && node.courseId) {
        // Tìm hoặc đẻ mới Thẻ Progress cho Sinh viên này
        let progress = await StudentProgress.findOne({
          studentId: req.user.id,
          courseId: node.courseId,
        });

        if (!progress) {
          progress = new StudentProgress({
            studentId: req.user.id,
            courseId: node.courseId,
          });
        }

        // Tăng đếm tổng số câu trả lời trong Hành trình
        progress.totalQuestionsAnswered += 1;
        progress.lastActiveAt = Date.now();

        // Check xem Học sinh đã trả lời ĐỦ 100% số câu hỏi trong Node hiện tại chưa
        const answeredCount = await Reflection.countDocuments({
          studentId: req.user.id,
          nodeId: nodeId,
        });

        const totalRequired = node.questions?.length || 0;

        // Nếu ĐỦ -> Update cờ Đã Hoàn Thành (Mở khóa map mới)
        if (answeredCount >= totalRequired && totalRequired > 0) {
          if (!progress.completedNodes.includes(nodeId)) {
            progress.completedNodes.push(nodeId);
          }
        }

        await progress.save();
      }
    } catch (progressError) {
      console.error("Lỗi chạy ngầm khi cập nhật Student Progress:", progressError);
      // Nuốt lỗi để không làm gián đoạn luồng Nộp bài chính
    }
    // --- KẾT THÚC: AUTO-UPDATE ---

    return res.status(201).json({
      success: true,
      message: "Tao reflection thanh cong",
      data: serializeReflection(reflection),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Ban da nop ban Reflection cho cau hoi nay roi. Hay dung API cap nhat.",
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

exports.getStudentReflectionsForCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "ID khong hop le" });
    }

    // Lấy toàn bộ mốc bài học (Nodes) của khoá Hành trình này
    const nodes = await Node.find({ courseId }).select("_id");
    const nodeIds = nodes.map((n) => n._id);

    // Truy xuất toàn bộ bản Reflection mà học sinh đã nộp ở bất kì Node nào trong mảng trên
    const reflections = await Reflection.find({
      studentId,
      nodeId: { $in: nodeIds },
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: reflections.map(serializeReflection),
    });
  } catch (error) {
    console.error("Get student reflections error:", error);
    return res.status(500).json({ success: false, message: "Loi Server" });
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

    if (nextIsPrivate !== null) {
      reflection.isPrivate = nextIsPrivate;
    }

    if (
      nextContent === null &&
      nextIsPrivate === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Khong co truong hop le de cap nhat",
      });
    }

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
