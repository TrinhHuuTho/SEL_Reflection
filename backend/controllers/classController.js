const ClassModel = require('../models/Class');
const Course = require('../models/Courses');

exports.getClasses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teacher_id) filter.teacher_id = req.query.teacher_id;
    if (req.query.centerId) filter.centerId = req.query.centerId;

    const classes = await ClassModel.find(filter);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách lớp thành công',
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lớp',
      error: error.message
    });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await ClassModel.findById(id);
    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin lớp thành công',
      data: cls
    });
  } catch (error) {
    console.error('Get class by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lớp',
      error: error.message
    });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { class_name, description, centerId, teacher_id } = req.body;
    if (!class_name || !description || !centerId || !teacher_id) {
      return res.status(400).json({
        success: false,
        message: 'class_name, description, centerId và teacher_id là bắt buộc'
      });
    }

    const cls = new ClassModel({
      class_name,
      description,
      centerId,
      teacher_id
    });
    await cls.save();
    res.status(201).json({
      success: true,
      message: 'Tạo lớp học thành công',
      data: cls
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lớp học',
      error: error.message
    });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cls = await ClassModel.findById(id);
    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }

    Object.assign(cls, updates, { updated_at: Date.now() });
    await cls.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật lớp học thành công',
      data: cls
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lớp học',
      error: error.message
    });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await ClassModel.findByIdAndDelete(id);
    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    await Course.deleteMany({ classId: id });
    res.status(200).json({
      success: true,
      message: 'Xoá lớp học thành công'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xoá lớp học',
      error: error.message
    });
  }
};

exports.getCoursesForClass = async (req, res) => {
  try {
    const { id } = req.params;
    const courses = await Course.find({ classId: id });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách khóa học của lớp thành công',
      data: courses
    });
  } catch (error) {
    console.error('Get courses for class error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy khóa học của lớp',
      error: error.message
    });
  }
};

exports.getClassInformation = async (req, res) => {
  try {
    const userId = req.user.id;
    const classInfo = await ClassModel.findOne({ teacher_id: userId });
    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học cho người dùng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin lớp thành công',
      data: classInfo
    });
  } catch (error) {
    console.error('Get class information error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lớp',
      error: error.message
    });
  }
};

exports.changeClassInformation = async (req, res) => {
  try {
    const userId = req.user.id;
    const allowedUpdates = ['class_name', 'description'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const classInfo = await ClassModel.findOne({ teacher_id: userId });
    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học để cập nhật'
      });
    }

    Object.assign(classInfo, updates, { updated_at: Date.now() });
    await classInfo.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin lớp thành công',
      data: classInfo
    });
  } catch (error) {
    console.error('Change class information error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin lớp',
      error: error.message
    });
  }
};