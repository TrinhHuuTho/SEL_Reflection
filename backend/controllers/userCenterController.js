const UserCenter = require('../models/UserCenter');
const Center = require('../models/Center');

// Lấy thông tin trung tâm mà user (giáo viên/học sinh) đang tham gia
exports.getMyCenter = async (req, res) => {
    try {
        const userId = req.user.id;

        // Tìm kiếm UserCenter và join (populate) để lấy data từ collection Center
        const userCenterLink = await UserCenter.findOne({ userId }).populate('centerId');

        if (!userCenterLink || !userCenterLink.centerId) {
            return res.status(200).json({ success: true, data: null, message: "User chưa tham gia trung tâm nào." });
        }

        res.status(200).json({ success: true, data: userCenterLink.centerId });
    } catch (error) {
        console.error("Lỗi getMyCenter:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// Tham gia vào một trung tâm
exports.joinCenter = async (req, res) => {
    try {
        const userId = req.user.id;
        const { centerId } = req.body;

        if (!centerId) {
            return res.status(400).json({ success: false, message: "Thiếu ID trung tâm." });
        }

        // Kiểm tra xem Center có tồn tại không
        const centerExists = await Center.findById(centerId);
        if (!centerExists) {
            return res.status(404).json({ success: false, message: "Trung tâm không tồn tại." });
        }

        // Kiểm tra xem User đã ở trong trung tâm nào chưa
        const existingLink = await UserCenter.findOne({ userId });
        if (existingLink) {
            return res.status(400).json({ success: false, message: "Bạn đã tham gia một trung tâm rồi. Vui lòng liên hệ Admin để thay đổi." });
        }

        // Tạo liên kết mới
        const newLink = new UserCenter({
            userId,
            centerId
        });
        await newLink.save();

        res.status(201).json({ success: true, message: "Tham gia trung tâm thành công!", data: centerExists });
    } catch (error) {
        console.error("Lỗi joinCenter:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Bạn đã tham gia trung tâm này rồi." });
        }
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};
