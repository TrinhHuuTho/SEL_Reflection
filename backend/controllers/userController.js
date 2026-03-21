const User = require('../models/User');
const UserCenter = require('../models/UserCenter');
const EmailJob = require('../models/EmailJob');
const transporter = require('../config/email');
const crypto = require('node:crypto');
const fs = require('node:fs').promises;
const path = require('node:path');

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
// Bulk create users (teacher/admin only)
exports.bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng users'
      });
    }

    const registerTemplatePath = path.join(__dirname, '../templates/emails/register.html');
    const registerTemplate = await fs.readFile(registerTemplatePath, 'utf-8');

    const normalizedUsers = users.map((u) => ({
      full_name: (u.full_name || '').trim(),
      email: (u.email || '').toLowerCase().trim(),
      role: (u.role || 'student').toLowerCase().trim()
    }));

    const inputEmails = normalizedUsers
      .map((u) => u.email)
      .filter(Boolean);

    const existingUsers = await User.find({ email: { $in: inputEmails } }).select('email');
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const results = {
      created: [],
      errors: []
    };

    for (const userData of normalizedUsers) {
      const { email, full_name, role } = userData;

      if (!email || !full_name) {
        results.errors.push({
          email: email || null,
          message: 'Thiếu email hoặc họ tên'
        });
        continue;
      }

      if (!email.includes('@')) {
        results.errors.push({
          email,
          message: 'Email không hợp lệ'
        });
        continue;
      }

      if (existingEmails.has(email)) {
        results.errors.push({
          email,
          message: 'Email đã tồn tại'
        });
        continue;
      }

      const generatedPassword = crypto.randomBytes(4).toString('hex');
      const newUser = new User({
        full_name,
        email,
        password: generatedPassword,
        role: role === 'teacher' ? 'teacher' : 'student'
      });

      try {
        await newUser.save();

        const emailHtml = registerTemplate
          .replaceAll('{{userName}}', newUser.full_name)
          .replaceAll('{{newPassword}}', generatedPassword)
          .replaceAll('{{currentYear}}', new Date().getFullYear());

        try {
          await EmailJob.create({
            to: newUser.email,
            subject: 'Chào mừng bạn đến với SEL Reflection',
            html: emailHtml
          });
        } catch (jobError) {
          results.errors.push({
            email: newUser.email,
            message: `Tạo user thành công nhưng tạo job gửi email thất bại: ${jobError.message}`
          });
        }

        results.created.push({
          id: newUser._id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          temporaryPassword: generatedPassword
        });
        existingEmails.add(email);
      } catch (saveError) {
        results.errors.push({
          email,
          message: saveError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk create users completed',
      data: results
    });
  } catch (error) {
    console.error('Bulk create users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh sách người dùng',
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

// Lấy toàn bộ danh sách người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ created_at: -1 });
    
    // Fetch toàn bộ khoá ngoại UserCenter để map vào
    const userCenters = await UserCenter.find({}).populate('centerId', 'centerName');
    
    const userCenterMap = {};
    for (const uc of userCenters) {
        if (uc.centerId && uc.centerId.centerName) {
            userCenterMap[uc.userId.toString()] = uc.centerId.centerName;
        }
    }

    const usersWithCenters = users.map(user => {
        const uObj = user.toObject();
        uObj.centerName = userCenterMap[user._id.toString()] || 'Chưa gán';
        return uObj;
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      count: usersWithCenters.length,
      data: usersWithCenters
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng',
      error: error.message
    });
  }
};