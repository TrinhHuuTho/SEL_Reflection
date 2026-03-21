const ClassMember = require('../models/ClassMember');
const UserCenter = require('../models/UserCenter');
const User = require('../models/User');
const ClassModel = require('../models/Class');

// Lấy danh sách học sinh của một lớp
exports.getMembersByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const members = await ClassMember.find({ classId }).populate({
            path: 'studentId',
            select: 'full_name email phone avatar student_id'
        });
        
        res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.error("Lỗi getMembersByClass:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
};

// Thêm một học sinh vào lớp
exports.addStudentToClass = async (req, res) => {
    try {
        const { classId, studentId } = req.body;
        if (!classId || !studentId) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin classId hoặc studentId" });
        }

        const newMember = new ClassMember({ classId, studentId });
        await newMember.save();

        // Trả về kèm data user để Frontend cập nhật bảng mượt mà
        const populatedMember = await ClassMember.findById(newMember._id).populate({
            path: 'studentId',
            select: 'full_name email phone avatar student_id'
        });

        res.status(201).json({ success: true, message: "Thêm học sinh thành công", data: populatedMember });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Học sinh này đã có trong lớp" });
        }
        console.error("Lỗi addStudentToClass:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
};

// Xóa học sinh khỏi lớp
exports.removeStudentFromClass = async (req, res) => {
    try {
        const { classId, studentId } = req.params;
        const deleted = await ClassMember.findOneAndDelete({ classId, studentId });
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu học sinh trong lớp này" });
        }
        res.status(200).json({ success: true, message: "Đã xóa học sinh khỏi lớp" });
    } catch (error) {
        console.error("Lỗi removeStudentFromClass:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
};

// Tìm học sinh rảnh trong trung tâm (Chưa tham gia lớp này)
exports.getAvailableStudents = async (req, res) => {
    try {
        const { centerId, classId } = req.params;

        // 1. Tìm tất cả User trong trung tâm
        const centerUsers = await UserCenter.find({ centerId });
        const userIdsInCenter = centerUsers.map(uc => uc.userId);

        // 2. Lọc ra chuẩn Role Student từ những User trên
        const allStudentsInCenter = await User.find({ 
            _id: { $in: userIdsInCenter },
            role: 'student'
        }).select('full_name email phone avatar student_id');

        // 3. Tìm danh sách học sinh ĐÃ THAM GIA lớp này
        const existingMembers = await ClassMember.find({ classId });
        const existingStudentIds = existingMembers.map(m => m.studentId.toString());

        // 4. Lọc để lấy những người CHƯA tham gia
        const availableStudents = allStudentsInCenter.filter(
            student => !existingStudentIds.includes(student._id.toString())
        );

        res.status(200).json({ success: true, count: availableStudents.length, data: availableStudents });
    } catch (error) {
        console.error("Lỗi getAvailableStudents:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
};

// Tìm các lớp mà học sinh đang tham gia
exports.getClassesForStudent = async (req, res) => {
    try {
        // Lấy studentId từ tham số URI, nếu không có thì lấy chính nó từ Token (API My Classes)
        const studentId = req.params.studentId || req.user?.id;

        if (!studentId) {
            return res.status(400).json({ success: false, message: "Thiếu ID học sinh" });
        }

        const classMemberships = await ClassMember.find({ studentId }).populate('classId');
        
        // Trích xuất list các thông tin Lớp học (bỏ những link rỗng)
        const classes = classMemberships
            .map(membership => membership.classId)
            .filter(cls => cls != null);
            
        res.status(200).json({ success: true, count: classes.length, data: classes });
    } catch (error) {
        console.error("Lỗi getClassesForStudent:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
};
