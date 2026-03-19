const Course = require('../models/Courses');

// Lấy danh sách khoá học
exports.getCourses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.classId = req.query.classId;
    }

    const courses = await Course.find(filter);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách khoá học thành công',
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khoá học',
      error: error.message
    });
  }
};

// Lấy chi tiết một khoá học theo id
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoá học'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin khoá học thành công',
      data: course
    });
  } catch (error) {
    console.error('Get course by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khoá học',
      error: error.message
    });
  }
};

// Tạo khoá học mới
exports.createCourse = async (req, res) => {
  try {
    const {
      classId,
      title,
      description,
      backgroundType,
      backgroundValue,
      isActive
    } = req.body;

    if (!classId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'classId, title và description là bắt buộc'
      });
    }

    const course = new Course({
      classId,
      title,
      description,
      backgroundType,
      backgroundValue,
      isActive,
      createdBy: req.user.id
    });

    await course.save();
    res.status(201).json({
      success: true,
      message: 'Tạo khoá học thành công',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khoá học',
      error: error.message
    });
  }
};

// Cập nhật khoá học
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoá học'
      });
    }

    Object.assign(course, updates, { updatedAt: Date.now() });
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật khoá học thành công',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khoá học',
      error: error.message
    });
  }
};

// Xoá khoá học
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoá học'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xoá khoá học thành công'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xoá khoá học',
      error: error.message
    });
  }
};
