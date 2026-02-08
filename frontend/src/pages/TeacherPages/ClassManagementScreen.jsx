import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classes } from '../../mocks/classes';
import { user_center } from '../../mocks/user_center';
import { centers } from '../../mocks/centers';
import { journeys } from '../../mocks/journeys';

const ClassManagementScreen = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [centerClasses, setCenterClasses] = useState([]);
    const [centerName, setCenterName] = useState('');
    const [expandedClasses, setExpandedClasses] = useState({});

    // Add Class State
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [newClassData, setNewClassData] = useState({ class_name: '', description: '' });

    useEffect(() => {
        if (user) {
            // 1. Find the center of the current teacher
            const userCenterLink = user_center.find(uc => uc.userId === user._id);
            if (userCenterLink) {
                const center = centers.find(c => c._id === userCenterLink.centerId);
                setCenterName(center ? center.centerName : 'Chưa cập nhật tên trung tâm');

                // 2. Filter classes belonging to this center
                const filteredClasses = classes.filter(c => c.centerId === userCenterLink.centerId);

                // 3. Attach journeys to each class
                const classesWithJourneys = filteredClasses.map(cls => {
                    const classJourneys = journeys.filter(j => j.classId === cls._id);
                    return { ...cls, journeys: classJourneys };
                });

                setCenterClasses(classesWithJourneys);

                // Optional: Expand all classes by default
                const initialExpanded = classesWithJourneys.reduce((acc, cls) => ({ ...acc, [cls._id]: true }), {});
                setExpandedClasses(initialExpanded);
            }
        }
    }, [user]);

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

    const handleAddClass = () => {
        if (!newClassData.class_name.trim()) {
            alert("Vui lòng nhập tên lớp!");
            return;
        }

        const userCenterLink = user_center.find(uc => uc.userId === user._id);
        const centerId = userCenterLink ? userCenterLink.centerId : 'unknown';

        const newClass = {
            _id: `temp-class-${Date.now()}`,
            centerId: centerId,
            class_name: newClassData.class_name,
            description: newClassData.description,
            journeys: [] // New class has no journeys initially
        };

        setCenterClasses([...centerClasses, newClass]);
        setExpandedClasses(prev => ({ ...prev, [newClass._id]: true })); // Expand new class
        setShowAddClassModal(false);
        setNewClassData({ class_name: '', description: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Add Class Modal */}
            {showAddClassModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
                        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Thêm Lớp Mới</h3>
                            <button onClick={() => setShowAddClassModal(false)} className="hover:bg-white/20 p-1 rounded-full text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                                <input
                                    type="text"
                                    value={newClassData.class_name}
                                    onChange={(e) => setNewClassData({ ...newClassData, class_name: e.target.value })}
                                    placeholder="Ví dụ: Lớp 6A1"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={newClassData.description}
                                    onChange={(e) => setNewClassData({ ...newClassData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Mô tả ngắn về lớp học..."
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    onClick={() => setShowAddClassModal(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddClass}
                                    className="px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-secondary transition-colors shadow-sm"
                                >
                                    Tạo lớp
                                </button>
                            </div>
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
                    <img
                        src={user?.avatar || "https://i.pravatar.cc/150"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border border-gray-200"
                    />
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
                                                    <h3 className="font-bold text-gray-800 text-lg">{cls.class_name}</h3>
                                                    <p className="text-xs text-gray-500">{cls.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 font-medium">
                                                {cls.journeys.length} hành trình
                                            </div>
                                        </div>

                                        {/* Journey List (Tree Children) */}
                                        <div className={`
                                            transition-all duration-300 ease-in-out overflow-hidden bg-white
                                            ${expandedClasses[cls._id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                                        `}>
                                            <div className="p-2 space-y-1">
                                                {cls.journeys.length === 0 ? (
                                                    <div className="p-3 ml-4 text-sm text-gray-400 italic">Chưa có hành trình nào.</div>
                                                ) : (
                                                    cls.journeys.map(journey => (
                                                        <div
                                                            key={journey._id}
                                                            onClick={() => navigate(`/teacher/journey/${journey._id}`)}
                                                            className="flex items-center p-3 ml-4 mr-2 rounded-lg hover:bg-green-50 cursor-pointer border-l-4 border-transparent hover:border-green-500 transition-all group"
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-green-500 mr-4 transition-colors"></div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-700 group-hover:text-green-700 transition-colors">
                                                                    {journey.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 line-clamp-1">
                                                                    {journey.description}
                                                                </p>
                                                            </div>
                                                            <button
                                                                className="opacity-0 group-hover:opacity-100 px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-md transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/teacher/journey/${journey._id}`);
                                                                }}
                                                            >
                                                                Chi tiết
                                                            </button>
                                                        </div>
                                                    ))
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
