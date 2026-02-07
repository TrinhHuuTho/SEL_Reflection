import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { centers } from '../../mocks/centers';
import { user_center } from '../../mocks/user_center';

const TeacherDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [showCenterModal, setShowCenterModal] = useState(false);

    useEffect(() => {
        if (user) {
            // Check if user is linked to a center
            const link = user_center.find(uc => uc.userId === user._id);
            if (link) {
                const center = centers.find(c => c._id === link.centerId);
                setSelectedCenter(center);
            } else {
                // Not linked -> Show modal
                setShowCenterModal(true);
            }
        }
    }, [user]);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    const handleSelectCenter = (center) => {
        setSelectedCenter(center);
        setShowCenterModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 relative">
            {/* Center Selection Modal */}
            {showCenterModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                        <div className="bg-brand-primary p-6 text-center">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                                Chào mừng Giáo viên mới! 👋
                            </h2>
                            <p className="text-blue-100 mt-2">
                                Vui lòng chọn Trung tâm bạn đang công tác để bắt đầu.
                            </p>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 bg-gray-50">
                            {centers.map(center => (
                                <div
                                    key={center._id}
                                    onClick={() => handleSelectCenter(center)}
                                    className="bg-white p-4 rounded-xl border-2 border-transparent hover:border-brand-primary cursor-pointer shadow-sm hover:shadow-md transition-all group"
                                >
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-brand-primary mb-1">
                                        {center.centerName}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        📍 {center.address}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-100 text-center text-xs text-gray-500">
                            *Việc chọn trung tâm giúp hệ thống hiển thị đúng danh sách lớp học của bạn.
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${showCenterModal ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="bg-brand-primary p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            {selectedCenter ? selectedCenter.centerName : "Teacher Dashboard"}
                        </h1>
                        {selectedCenter && (
                            <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                                🏢 {selectedCenter.address}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold backdrop-blur-sm"
                    >
                        Đăng xuất
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <img
                            src={user?.avatar || "https://i.pravatar.cc/150"}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full border-2 border-brand-primary"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Xin chào, {user?.full_name}!</h2>
                            <p className="text-gray-500">{user?.email}</p>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mt-1">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate('/teacher/classes')}
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                                📚
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary mb-2">Quản lý Lớp học</h3>
                            <p className="text-gray-600 mb-4 text-sm">Xem và quản lý danh sách học sinh trong các lớp của bạn tại trung tâm.</p>
                            <button
                                className="text-brand-secondary font-bold hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/teacher/classes');
                                }}
                            >
                                Xem danh sách ➜
                            </button>
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                                📊
                            </div>
                            <h3 className="text-xl font-bold text-green-700 mb-2">Thống kê & Báo cáo</h3>
                            <p className="text-gray-600 mb-4 text-sm">Xem tiến độ học tập và kết quả phản tư của học sinh.</p>
                            <button className="text-green-600 font-bold hover:underline">
                                Xem báo cáo ➜
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
