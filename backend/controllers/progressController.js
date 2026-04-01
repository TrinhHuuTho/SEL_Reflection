const mongoose = require("mongoose");
const StudentProgress = require("../models/StudentProgress");

// [STUDENT] Lấy Tiến độ Hành trình của Học sinh đang Đăng nhập
exports.getMyProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "courseId không hợp lệ",
      });
    }

    const progress = await StudentProgress.findOne({
      courseId,
      studentId: req.user.id,
    });

    // Nếu Học sinh chưa có Tương tác nào (Chưa làm bài) thì trả về khung trống mặc định
    if (!progress) {
      return res.status(200).json({
        success: true,
        data: {
          completedNodes: [],
          totalQuestionsAnswered: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy tiến độ cá nhân thành công",
      data: progress,
    });
  } catch (error) {
    console.error("Get my progress error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tiến trình cá nhân",
      error: error.message,
    });
  }
};

// [TEACHER] Lấy Danh sách Tất cả Tiến độ của các Học sinh trong 1 Hành trình
exports.getClassProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "courseId không hợp lệ",
      });
    }

    const progresses = await StudentProgress.find({ courseId }).populate(
      "studentId",
      "full_name avatar email"
    );

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê Tiến độ Lớp thành công",
      data: progresses,
    });
  } catch (error) {
    console.error("Get class progress error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi truy Xuất Thống Kê",
      error: error.message,
    });
  }
};
