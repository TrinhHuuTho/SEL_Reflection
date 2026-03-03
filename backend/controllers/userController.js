const User = require('../models/User');

// Lấy thông tin người dùng
exports.getUserInformation = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user information error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// Thay đổi thông tin người dùng
exports.changeUserInformation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, avatar } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    if (full_name) {
      if (full_name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Tên phải có ít nhất 2 ký tự'
        });
      }
      user.full_name = full_name.trim();
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Change user information error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin người dùng',
      error: error.message
    });
  }
};