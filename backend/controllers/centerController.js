const Center = require('../models/Center');

// Lấy danh sách toàn bộ Trung tâm
exports.getAllCenters = async (req, res) => {
  try {
    const centers = await Center.find().sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: centers.length,
      data: centers
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách trung tâm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách trung tâm'
    });
  }
};

// Tạo một trung tâm mới
exports.createCenter = async (req, res) => {
  try {
    const { centerName, address, description, hotline } = req.body;

    if (!centerName || !address) {
      return res.status(400).json({
        success: false,
        message: 'Tên trung tâm và địa chỉ là bắt buộc'
      });
    }

    const existingCenter = await Center.findOne({ centerName: centerName.trim() });
    if (existingCenter) {
      return res.status(409).json({
        success: false,
        message: 'Trung tâm này đã tồn tại trong hệ thống'
      });
    }

    const newCenter = new Center({
      centerName: centerName.trim(),
      address: address.trim(),
      description: description ? description.trim() : '',
      hotline: hotline ? hotline.trim() : ''
    });

    await newCenter.save();

    res.status(201).json({
      success: true,
      message: 'Tạo trung tâm thành công',
      data: newCenter
    });
  } catch (error) {
    console.error('Lỗi khi tạo trung tâm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo trung tâm',
      error: error.message
    });
  }
};

// Xóa một trung tâm
exports.deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;

    const center = await Center.findById(id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trung tâm'
      });
    }

    await center.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa trung tâm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa trung tâm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa trung tâm',
      error: error.message
    });
  }
};
