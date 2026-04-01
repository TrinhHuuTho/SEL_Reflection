import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCenter } from '../../services/centerService';
import { getClasses, createClass } from '../../services/classService';
import { getMembersByClass, addStudentToClass, removeStudentFromClass, getAvailableStudents } from '../../services/classMemberService';
import { createCourse, getCourses } from '../../services/courseService';

const ClassManagementScreen = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [centerClasses, setCenterClasses] = useState([]);
    const [centerName, setCenterName] = useState('Đang tải...');
    const [currentCenterId, setCurrentCenterId] = useState(null);
    const [expandedClasses, setExpandedClasses] = useState({});

    // Tab State: Lưu tab hiện tại đang chọn của mỗi lớp (default là 'journeys')
    const [activeTabs, setActiveTabs] = useState({});

    // Member State
    const [classMembers, setClassMembers] = useState({}); // { classId: [member1, member2] }

    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedTargetClassId, setSelectedTargetClassId] = useState(null);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [isAddingStudent, setIsAddingStudent] = useState(false);

    // Add Class State
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [newClassData, setNewClassData] = useState({ class_name: '', description: '' });
    const [isCreating, setIsCreating] = useState(false);

    // Add Journey State
    const [showAddJourneyModal, setShowAddJourneyModal] = useState(false);
    const [newJourneyData, setNewJourneyData] = useState({ title: '', description: '' });
    const [selectedTargetClassIdForJourney, setSelectedTargetClassIdForJourney] = useState(null);
    const [isCreatingJourney, setIsCreatingJourney] = useState(false);

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        try {
            // 1. Nhờ API check xem User này có nằm trong Center nào không
            const centerRes = await getMyCenter();
            let cId = null;
            if (centerRes.success && centerRes.data) {
                setCenterName(centerRes.data.centerName);
                cId = centerRes.data._id;
                setCurrentCenterId(cId);
            } else {
                setCenterName('Chưa gán trung tâm');
                return; // Ngừng nếu chưa có trung tâm
            }

            // 2. Lấy dữ liệu Class đổ từ Database xuống
            const teacherId = user._id || user.id;
            const classRes = await getClasses({ centerId: cId, teacher_id: teacherId });

            if (classRes.success) {
                const fetchedClasses = classRes.data;

                // Fetch song song danh sách Hành trình (Courses/Journeys) của TẤT CẢ các lớp
                const journeyPromises = fetchedClasses.map(cls => getCourses(cls._id));
                const journeyResults = await Promise.all(journeyPromises);

                // Dán array journeys thật từ DB vô mỗi Lớp
                const classesWithJourneys = fetchedClasses.map((cls, idx) => {
                    const res = journeyResults[idx];
                    const classJourneys = (res && res.success && res.data) ? res.data : [];
                    return { ...cls, journeys: classJourneys };
                });

                setCenterClasses(classesWithJourneys);

                const initialExpanded = classesWithJourneys.reduce((acc, cls) => ({ ...acc, [cls._id]: true }), {});
                setExpandedClasses(initialExpanded);

                const defaultTabs = classesWithJourneys.reduce((acc, cls) => ({ ...acc, [cls._id]: 'journeys' }), {});
                setActiveTabs(defaultTabs);

                // Fetch song song danh sách sinh viên của TẤT CẢ các lớp
                const memberPromises = classesWithJourneys.map(cls => getMembersByClass(cls._id));
                const memberResults = await Promise.all(memberPromises);

                const newClassMembers = {};
                classesWithJourneys.forEach((cls, idx) => {
                    const res = memberResults[idx];
                    newClassMembers[cls._id] = (res && res.success) ? res.data : [];
                });
                setClassMembers(newClassMembers);
            }
        } catch (error) {
            console.error("Lỗi fetch data lớp học:", error);
        }
    };

    const toggleClass = (classId) => {
        setExpandedClasses(prev => ({
            ...prev,
            [classId]: !prev[classId]
        }));
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/login');
    };

    const handleAddClass = async () => {
        if (!newClassData.class_name.trim() || !newClassData.description.trim()) {
            alert("Vui lòng nhập đầy đủ tên lớp và mô tả!");
            return;
        }

        if (!currentCenterId) {
            alert("Lỗi: Bạn chưa được chỉ định trung tâm nào trên hệ thống.");
            return;
        }

        setIsCreating(true);
        try {
            const formData = {
                class_name: newClassData.class_name,
                description: newClassData.description,
                centerId: currentCenterId,
                teacher_id: user._id || user.id
            };

            const res = await createClass(formData);
            if (res.success) {
                // Ghép lớp mới vô danh sách kèm bảng map trống journeys
                const newClass = { ...res.data, journeys: [] };
                setCenterClasses([...centerClasses, newClass]);
                setExpandedClasses(prev => ({ ...prev, [newClass._id]: true }));
                setActiveTabs(prev => ({ ...prev, [newClass._id]: 'journeys' }));
                setClassMembers(prev => ({ ...prev, [newClass._id]: [] }));

                setShowAddClassModal(false);
                setNewClassData({ class_name: '', description: '' });
            } else {
                alert(res.message || "Lỗi tạo lớp học");
            }
        } catch (error) {
            console.error("Lỗi tạo lớp học API:", error);
            alert(error.response?.data?.message || "Lỗi máy chủ rớt mạng (Server config)");
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddJourneySubmit = async () => {
        if (!newJourneyData.title.trim() || !newJourneyData.description.trim()) {
            alert('Vui lòng nhập tên và mô tả cho chủ đề/hành trình!');
            return;
        }

        setIsCreatingJourney(true);
        try {
            const formData = {
                title: newJourneyData.title.trim(),
                description: newJourneyData.description.trim(),
                classId: selectedTargetClassIdForJourney,
                isActive: true
            };

            const res = await createCourse(formData);
            if (res.success && res.data) {
                // Thêm data Khóa học vừa tạo thành công vào Cấu trúc mảng state ảo hiện hành
                setCenterClasses(prevClasses => prevClasses.map(cls => {
                    if (cls._id === selectedTargetClassIdForJourney) {
                        return {
                            ...cls,
                            journeys: [...cls.journeys, res.data]
                        };
                    }
                    return cls;
                }));

                setShowAddJourneyModal(false);
                setNewJourneyData({ title: '', description: '' });
            } else {
                alert(res.message || 'Lỗi tạo hành trình mờ mịt');
            }
        } catch (error) {
            console.error('Lỗi khi Tạo Hành trình API:', error);
            alert(error.response?.data?.message || 'Có lỗi máy chủ API!');
        } finally {
            setIsCreatingJourney(false);
        }
    };

    // --- STUDENT MANAGEMENT LOGIC ---
    const handleOpenStudentModal = async (classId) => {
        setSelectedTargetClassId(classId);
        setShowStudentModal(true);
        setIsLoadingAvailable(true);
        setSelectedStudentId('');

        try {
            const res = await getAvailableStudents(currentCenterId, classId);
            if (res.success) {
                setAvailableStudents(res.data || []);
            } else {
                alert(res.message);
                setAvailableStudents([]);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi tải học sinh rảnh: " + error.message);
        } finally {
            setIsLoadingAvailable(false);
        }
    };

    const handleAddStudentSubmit = async () => {
        if (!selectedStudentId) {
            alert("Vui lòng chọn học sinh!");
            return;
        }

        setIsAddingStudent(true);
        try {
            const res = await addStudentToClass(selectedTargetClassId, selectedStudentId);
            if (res.success && res.data) {
                // Phục hồi lại dữ liệu trả về và cắm vô state
                setClassMembers(prev => ({
                    ...prev,
                    [selectedTargetClassId]: [...(prev[selectedTargetClassId] || []), res.data]
                }));
                setShowStudentModal(false);
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Lỗi khi gán học sinh");
        } finally {
            setIsAddingStudent(false);
        }
    };

    const handleRemoveStudent = async (classId, studentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn bỏ học sinh này khỏi lớp?")) return;

        try {
            const res = await removeStudentFromClass(classId, studentId);
            if (res.success) {
                setClassMembers(prev => ({
                    ...prev,
                    [classId]: prev[classId].filter(m => m.studentId?._id !== studentId && m.studentId?.id !== studentId)
                }));
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert("Lỗi xóa học sinh khỏi lớp");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Add Class Modal */}
            {showAddClassModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp relative">
                        {/* Loading Overlay */}
                        {isCreating && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="text-brand-primary font-bold flex flex-col items-center">
                                    <svg className="animate-spin h-8 w-8 text-brand-primary mb-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang khởi tạo lớp học...
                                </div>
                            </div>
                        )}
                        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Thêm Lớp Mới</h3>
                            <button disabled={isCreating} onClick={() => setShowAddClassModal(false)} className="hover:bg-white/20 p-1 rounded-full text-xl leading-none transition-colors">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                                <input
                                    type="text"
                                    disabled={isCreating}
                                    value={newClassData.class_name}
                                    onChange={(e) => setNewClassData({ ...newClassData, class_name: e.target.value })}
                                    placeholder="Ví dụ: Lớp 6A1"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    disabled={isCreating}
                                    value={newClassData.description}
                                    onChange={(e) => setNewClassData({ ...newClassData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Mô tả ngắn về lớp học..."
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none disabled:opacity-50"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    disabled={isCreating}
                                    onClick={() => setShowAddClassModal(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    disabled={isCreating}
                                    onClick={handleAddClass}
                                    className="px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-secondary transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isCreating ? 'Đang tạo...' : 'Tạo lớp'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Journey Modal */}
            {showAddJourneyModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp relative">
                        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Thêm Hành trình mới</h3>
                            <button onClick={() => setShowAddJourneyModal(false)} className="hover:bg-white/20 p-1 rounded-full text-xl leading-none transition-colors">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hành trình / Chủ đề</label>
                                <input
                                    type="text"
                                    value={newJourneyData.title}
                                    onChange={(e) => setNewJourneyData({ ...newJourneyData, title: e.target.value })}
                                    placeholder="Ví dụ: Cảm xúc Mùa thu"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={newJourneyData.description}
                                    onChange={(e) => setNewJourneyData({ ...newJourneyData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Mô tả nội dung học tập..."
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button onClick={() => setShowAddJourneyModal(false)} disabled={isCreatingJourney} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
                                <button
                                    disabled={isCreatingJourney}
                                    onClick={handleAddJourneySubmit}
                                    className="px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-secondary transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isCreatingJourney ? 'Đang tạo...' : 'Tạo hành trình'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Student Modal */}
            {showStudentModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp relative">
                        {isAddingStudent && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <span className="font-bold text-brand-primary">Đang gán học sinh...</span>
                            </div>
                        )}
                        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Gán học sinh vào Lớp</h3>
                            <button disabled={isAddingStudent} onClick={() => setShowStudentModal(false)} className="hover:bg-white/20 p-1 rounded-full text-xl leading-none transition-colors">&times;</button>
                        </div>
                        <div className="p-6">
                            {isLoadingAvailable ? (
                                <div className="text-center py-6">Đang tải danh sách học sinh rảnh...</div>
                            ) : availableStudents.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 italic">Không có học sinh nào trống trong Trung tâm.</div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Chọn 1 Học sinh xuất hiện trong danh sách:</label>
                                    <select
                                        disabled={isAddingStudent}
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="">-- Chọn học sinh --</option>
                                        {availableStudents.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.student_id ? `[${student.student_id}] ` : ''}{student.full_name} ({student.email})
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex gap-3 justify-end mt-4">
                                        <button disabled={isAddingStudent} onClick={() => setShowStudentModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Hủy</button>
                                        <button disabled={isAddingStudent} onClick={handleAddStudentSubmit} className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">Gán vào</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Quản lý Lớp học</h1>
                        <p className="text-sm text-brand-primary font-medium">{centerName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddClassModal(true)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-secondary transition-all flex items-center gap-2"
                    >
                        <span>➕ Thêm Lớp</span>
                    </button>

                    <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

                    <span className="text-sm font-semibold text-gray-600 hidden md:block">
                        {user?.full_name}
                    </span>
                    <div className="w-16 h-16 rounded-full border-2 border-brand-primary overflow-hidden flex-shrink-0">
                        {typeof user?.avatar === 'object' && user?.avatar?.image ? (
                            <img
                                src={user.avatar.image}
                                alt={user.avatar.name}
                                className="w-full h-full object-contain"
                            />
                        ) : typeof user?.avatar === 'object' && user?.avatar?.emoji ? (
                            <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${user.avatar.color}`}>
                                {user.avatar.emoji}
                            </div>
                        ) : (
                            <img
                                src={user?.avatar || "https://i.pravatar.cc/150"}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Content - Tree View */}
            <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            🗂 Danh sách lớp học
                        </h2>
                        <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {centerClasses.length} lớp
                        </span>
                    </div>

                    <div className="p-6">
                        {centerClasses.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <p>Chưa có dữ liệu lớp học nào.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {centerClasses.map(cls => (
                                    <div key={cls._id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        {/* Class Header (Tree Node) */}
                                        <div
                                            onClick={() => toggleClass(cls._id)}
                                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-transform duration-300
                                                    ${expandedClasses[cls._id] ? 'bg-brand-primary text-white rotate-90' : 'bg-gray-200 text-gray-500'}
                                                `}>
                                                    ▶
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                        {cls.class_name}
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full whitespace-nowrap hidden md:inline-block">
                                                            {classMembers[cls._id]?.length || 0} học sinh
                                                        </span>
                                                    </h3>
                                                    <p className="text-xs text-gray-500">{cls.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 font-medium hidden sm:block">
                                                {cls.journeys.length} hành trình
                                            </div>
                                        </div>

                                        {/* Expanded Area */}
                                        <div className={`
                                            transition-all duration-300 ease-in-out overflow-hidden bg-white
                                            ${expandedClasses[cls._id] ? 'max-h-[800px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}
                                        `}>
                                            {/* Tab Navigation */}
                                            <div className="flex border-b border-gray-100 px-4 pt-2">
                                                <button
                                                    onClick={() => setActiveTabs(p => ({ ...p, [cls._id]: 'journeys' }))}
                                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTabs[cls._id] === 'journeys' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Hành trình
                                                </button>
                                                <button
                                                    onClick={() => setActiveTabs(p => ({ ...p, [cls._id]: 'students' }))}
                                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTabs[cls._id] === 'students' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Học sinh ({classMembers[cls._id]?.length || 0})
                                                </button>
                                            </div>

                                            {/* Target Tab Contents */}
                                            <div className="p-2 bg-white">

                                                {/* Tab HÀNH TRÌNH */}
                                                {activeTabs[cls._id] === 'journeys' && (
                                                    <div className="p-2">
                                                        <div className="flex justify-end mb-3">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTargetClassIdForJourney(cls._id);
                                                                    setShowAddJourneyModal(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-blue-50 text-brand-primary hover:bg-brand-primary hover:text-white rounded text-sm font-bold border border-blue-200 hover:border-transparent transition-colors flex items-center gap-1"
                                                            >
                                                                <span>➕Thêm hành trình</span>
                                                            </button>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {cls.journeys.length === 0 ? (
                                                                <div className="p-4 text-center text-sm text-gray-400 italic bg-gray-50/50 rounded-lg m-2 border border-dashed border-gray-200">
                                                                    Chưa có bài học / hành trình nào.
                                                                </div>
                                                            ) : (
                                                                cls.journeys.map(journey => (
                                                                    <div
                                                                        key={journey._id}
                                                                        onClick={() => navigate(`/teacher/journey/${journey._id}`)}
                                                                        className="flex items-center p-3 ml-2 mr-2 rounded-lg hover:bg-blue-50 cursor-pointer border-l-4 border-transparent hover:border-brand-primary transition-all group"
                                                                    >
                                                                        <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-brand-primary mr-4 transition-colors"></div>
                                                                        <div className="flex-1">
                                                                            <h4 className="font-bold text-gray-700 group-hover:text-brand-primary transition-colors">
                                                                                {journey.title}
                                                                            </h4>
                                                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                                                {journey.description}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            className="opacity-0 group-hover:opacity-100 px-3 py-1 text-xs font-bold text-brand-primary bg-blue-100 rounded-md transition-opacity"
                                                                        >
                                                                            Chi tiết
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tab HỌC SINH */}
                                                {activeTabs[cls._id] === 'students' && (
                                                    <div className="p-2">
                                                        <div className="flex justify-end mb-3">
                                                            <button
                                                                onClick={() => handleOpenStudentModal(cls._id)}
                                                                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded text-sm font-bold border border-green-200 hover:border-transparent transition-colors flex items-center gap-1"
                                                            >
                                                                <span>➕Thêm HS</span>
                                                            </button>
                                                        </div>

                                                        {(!classMembers[cls._id] || classMembers[cls._id].length === 0) ? (
                                                            <div className="p-4 text-center text-sm text-gray-400 italic bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                                                Lớp này trống không. Khuyên bạn nên thêm vào vài học sinh để bắt đầu tương tác!
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                                                                {classMembers[cls._id].map(member => {
                                                                    // Parse avatar if it's a JSON string
                                                                    let parsedAvatar = member.studentId?.avatar;
                                                                    if (typeof parsedAvatar === 'string') {
                                                                        try {
                                                                            parsedAvatar = JSON.parse(parsedAvatar);
                                                                        } catch (e) {
                                                                            // Not JSON, keep as string (URL)
                                                                        }
                                                                    }
                                                                    
                                                                    return (
                                                                    <div key={member._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg shadow-sm bg-gray-50/50 hover:bg-gray-50">
                                                                        <div className="flex items-center gap-3">
                                                                            {/* Avatar rendering - same logic as Header.jsx */}
                                                                            <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                                                                                {typeof parsedAvatar === 'object' && parsedAvatar?.image ? (
                                                                                    <img
                                                                                        src={parsedAvatar.image}
                                                                                        alt={parsedAvatar.name}
                                                                                        className="w-full h-full object-contain"
                                                                                    />
                                                                                ) : typeof parsedAvatar === 'object' && parsedAvatar?.emoji ? (
                                                                                    <div className={`w-full h-full flex items-center justify-center text-lg ${parsedAvatar?.color}`}>
                                                                                        {parsedAvatar?.emoji}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-sm">
                                                                                        👤
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <p className="text-sm font-bold text-gray-800 truncate">{member.studentId?.full_name || 'Vô danh'}</p>
                                                                                <p className="text-xs text-gray-500 truncate">{member.studentId?.email}</p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleRemoveStudent(cls._id, member.studentId?._id)}
                                                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                                                                            title="Xóa khỏi lớp"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassManagementScreen;
