const mongoose = require("mongoose");
const Node = require("../models/Node");

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
    const {
      courseId,
      title,
      order,
      positionX,
      positionY,
      description,
      isOpen,
    } = req.body;

    if (!courseId || !title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: "courseId, title và order là bắt buộc",
      });
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
      positionX,
      positionY,
      description,
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
      "positionX",
      "positionY",
      "description",
      "isOpen",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        node[field] = req.body[field];
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
