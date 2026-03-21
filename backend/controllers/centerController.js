const Center = require('../models/Center');
const User = require('../models/User');
const UserCenter = require('../models/UserCenter');

exports.getCenters = async (req, res) => {
  try {
    const centers = await Center.find();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách trung tâm thành công',
      data: centers
    });
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách trung tâm',
      error: error.message
    });
  }
};

exports.getCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await Center.findById(id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trung tâm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin trung tâm thành công',
      data: center
    });
  } catch (error) {
    console.error('Get center by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin trung tâm',
      error: error.message
    });
  }
};

exports.createCenter = async (req, res) => {
  try {
    const { centerName, address, description, hotline } = req.body;

    if (!centerName || !address || !description || !hotline) {
      return res.status(400).json({
        success: false,
        message: 'centerName, address, description và hotline là bắt buộc'
      });
    }

    const center = new Center({
      centerName,
      address,
      description,
      hotline
    });

    await center.save();

    res.status(201).json({
      success: true,
      message: 'Tạo trung tâm thành công',
      data: center
    });
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo trung tâm',
      error: error.message
    });
  }
};

exports.updateCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const center = await Center.findById(id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trung tâm'
      });
    }

    Object.assign(center, updates);
    await center.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trung tâm thành công',
      data: center
    });
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trung tâm',
      error: error.message
    });
  }
};

exports.deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await Center.findByIdAndDelete(id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trung tâm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xoá trung tâm thành công'
    });
  } catch (error) {
    console.error('Delete center error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xoá trung tâm',
      error: error.message
    });
  }
};

exports.addTeachersToCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherIds } = req.body;

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng teacherIds'
      });
    }

    const center = await Center.findById(id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trung tâm'
      });
    }

    const teachers = await User.find({
      _id: { $in: teacherIds },
      role: 'teacher'
    });

    if (teachers.length !== teacherIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Một số teacherIds không hợp lệ hoặc không phải là giáo viên'
      });
    }

    const results = {
      added: [],
      errors: []
    };

    for (const teacherId of teacherIds) {
      try {
        const existing = await UserCenter.findOne({ userId: teacherId });
        if (existing) {
          results.errors.push({
            teacherId,
            message: 'Giáo viên đã thuộc trung tâm khác'
          });
          continue;
        }

        const userCenter = new UserCenter({
          userId: teacherId,
          centerId: id
        });

        await userCenter.save();
        results.added.push(teacherId);
      } catch (error) {
        results.errors.push({
          teacherId,
          message: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Đã thêm ${results.added.length} giáo viên vào trung tâm`,
      data: results
    });
  } catch (error) {
    console.error('Add teachers to center error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm giáo viên vào trung tâm',
      error: error.message
    });
  }
};
