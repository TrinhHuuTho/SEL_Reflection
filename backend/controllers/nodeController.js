const mongoose = require("mongoose");
const Node = require("../models/Node");

// Helper function để định dạng mảng questions thành Object chuẩn (Tránh CastError db)
const formatQuestions = (questions) => {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => {
    if (typeof q === "string") return { content: q };
    if (typeof q === "object" && q !== null) {
      // Cho phép giữ lại id tự sinh từ UI hoặc tạo content thôi mảng Mongoose tự gán
      return q; 
    }
    return { content: String(q) };
  });
};

// Lấy danh sách node
exports.getNodes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.courseId)) {
        return res.status(400).json({
          success: false,
          message: "courseId không hợp lệ",
        });
      }
      filter.courseId = req.query.courseId;
    }

    const nodes = await Node.find(filter).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách node thành công",
      data: nodes,
    });
  } catch (error) {
    console.error("Get nodes error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách node",
      error: error.message,
    });
  }
};

// Lấy chi tiết một node theo id
exports.getNodeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Node id không hợp lệ",
      });
    }

    const node = await Node.findById(id);

    if (!node) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy node",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin node thành công",
      data: node,
    });
  } catch (error) {
    console.error("Get node by id error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin node",
      error: error.message,
    });
  }
};

// Tạo node mới
exports.createNode = async (req, res) => {
  try {
    let {
      courseId,
      title,
      order,
      description,
      questions,
      isOpen,
    } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        message: "courseId và title là bắt buộc",
      });
    }

    // Nếu không truyền order từ Client, tự động lấy Max Order trong DB + 1
    if (order === undefined || order === null) {
      const lastNode = await Node.findOne({ courseId }).sort({ order: -1 });
      order = lastNode ? lastNode.order + 1 : 1;
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "courseId không hợp lệ",
      });
    }

    const node = new Node({
      courseId,
      title,
      order,
      description,
      questions: formatQuestions(questions),
      isOpen,
    });

    await node.save();

    res.status(201).json({
      success: true,
      message: "Tạo node thành công",
      data: node,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Thứ tự node đã tồn tại trong course này",
      });
    }
    console.error("Create node error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo node",
      error: error.message,
    });
  }
};

// Cập nhật node
exports.updateNode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Node id không hợp lệ",
      });
    }

    const node = await Node.findById(id);

    if (!node) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy node",
      });
    }

    const allowedFields = [
      "title",
      "order",
      "description",
      "questions",
      "isOpen",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "questions") {
          node.questions = formatQuestions(req.body.questions);
        } else {
          node[field] = req.body[field];
        }
      }
    });

    await node.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật node thành công",
      data: node,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Thứ tự node đã tồn tại trong course này",
      });
    }
    console.error("Update node error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật node",
      error: error.message,
    });
  }
};

// Xóa node
exports.deleteNode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Node id không hợp lệ",
      });
    }

    const node = await Node.findById(id);

    if (!node) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy node",
      });
    }

    await node.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa node thành công",
    });
  } catch (error) {
    console.error("Delete node error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa node",
      error: error.message,
    });
  }
};

// Cập nhật vị trí các node (Bulk Reorder)
exports.updateNodesOrder = async (req, res) => {
  try {
    const { courseId, nodes } = req.body;
    // nodes là mảng [{ _id: "...", order: 1 }, { _id: "...", order: 2 }]

    if (!courseId || !nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
    }

    // Bước 1: Set order thành âm (-) trước để xóa bỏ xung đột Unique Index (Lỗi 11000)
    const negativeUpdates = nodes.map((node, index) => ({
      updateOne: {
        filter: { _id: node._id, courseId },
        update: { $set: { order: -(node.order + 1000 + index) } }
      }
    }));
    if (negativeUpdates.length > 0) {
      await Node.bulkWrite(negativeUpdates);
    }

    // Bước 2: Lật ngược lại gán order số Dương hoàn thiện
    const positiveUpdates = nodes.map((node) => ({
      updateOne: {
        filter: { _id: node._id, courseId },
        update: { $set: { order: node.order } }
      }
    }));
    if (positiveUpdates.length > 0) {
      await Node.bulkWrite(positiveUpdates);
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thứ tự hoàn tất",
    });
  } catch (error) {
    console.error("Reorder nodes error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi đổi vị trí",
      error: error.message,
    });
  }
};
