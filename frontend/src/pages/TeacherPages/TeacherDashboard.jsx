import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCenters, getMyCenter, joinCenter } from '../../services/centerService';

const normalizeAvatar = (avatar) => {
    if (!avatar) return null;

    if (typeof avatar === 'string') {
        try {
            const parsed = JSON.parse(avatar);
            if (parsed && typeof parsed === 'object' && parsed.image) {
                return parsed.image;
            }
            return avatar;
        } catch (e) {
            return avatar;
        }
    }

    if (typeof avatar === 'object' && avatar.image) {
        return avatar.image;
    }

    return null;
};

const TeacherDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [showCenterModal, setShowCenterModal] = useState(false);

    const [apiCenters, setApiCenters] = useState([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [joinMessage, setJoinMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            checkUserCenter();
        }
    }, [user]);

    const checkUserCenter = async () => {
        try {
            const res = await getMyCenter();
            if (res.success && res.data) {
                // Đã có trung tâm
                setSelectedCenter(res.data);
            } else {
                // Chưa có trung tâm
                setShowCenterModal(true);
                fetchCentersFromDB();
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra trung tâm của user:", error);
            // Fallback (Nếu lỗi mạng thì vẫn cho phép chọn lại)
            setShowCenterModal(true);
            fetchCentersFromDB();
        }
    };

    const fetchCentersFromDB = async () => {
        setIsLoadingCenters(true);
        try {
            const res = await getAllCenters();
            if (res.success) {
                // Lọc chỉ lấy các trung tâm đang Active
                setApiCenters(res.data.filter(c => c.isActive));
            }
        } catch (error) {
            console.error("Lỗi fetch centers:", error);
        } finally {
            setIsLoadingCenters(false);
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    const handleSelectCenter = async (center) => {
        // Tránh double click khi đang tải
        if (isJoining) return;

        setIsJoining(true);
        setJoinMessage({ text: '', type: '' });

        try {
            const res = await joinCenter(center._id);
            if (res.success) {
                setJoinMessage({ text: 'Gia nhập lớp thành công!', type: 'success' });

                // Đợi 1s cho User nhìn thấy thông báo xanh
                setTimeout(() => {
                    setSelectedCenter(res.data || center);
                    setShowCenterModal(false);
                }, 1000);
            } else {
                setJoinMessage({ text: res.message || 'Có lỗi xảy ra', type: 'error' });
            }
        } catch (error) {
            console.error("Lỗi khi tham gia trung tâm:", error);
            setJoinMessage({ text: error.response?.data?.message || 'Có lỗi phía server. Vui lòng thử lại!', type: 'error' });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 relative">
            {/* Center Selection Modal */}
            {showCenterModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                        <div className="bg-brand-primary p-6 text-center relative">
                            {/* Loading Overlay */}
                            {isJoining && (
                                <div className="absolute inset-0 bg-brand-primary/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="text-white font-bold flex flex-col items-center">
                                        <svg className="animate-spin h-8 w-8 text-white mb-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang thiết lập hồ sơ...
                                    </div>
                                </div>
                            )}

                            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                                Chào mừng Giáo viên mới! 👋
                            </h2>
                            <p className="text-blue-100 mt-2">
                                Vui lòng chọn Trung tâm bạn đang công tác để bắt đầu.
                            </p>

                            {joinMessage.text && (
                                <div className={`mt-4 p-3 rounded-lg text-sm font-bold shadow-lg ${joinMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {joinMessage.text}
                                </div>
                            )}
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 bg-gray-50 relative">
                            {isLoadingCenters ? (
                                <div className="text-center py-8 text-gray-500 font-medium">
                                    <svg className="animate-spin h-8 w-8 text-brand-primary mx-auto mb-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải danh sách trung tâm...
                                </div>
                            ) : apiCenters.length > 0 ? (
                                apiCenters.map(center => (
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
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 font-medium">
                                    Chưa có trung tâm nào đang hoạt động trên hệ thống.
                                </div>
                            )}
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
                            )}
                        </div>
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

                        <div
                            className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate('/teacher/profile')}
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                                👤
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary mb-2">Hồ sơ cá nhân</h3>
                            <p className="text-gray-600 mb-4 text-sm">Xem thông tin cá nhân và đổi mật khẩu.</p>
                            <button
                                className="text-brand-secondary font-bold hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/teacher/profile');
                                }}
                            >
                                Xem hồ sơ ➜
                            </button>
                        </div>

                        <div
                            className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate('/teacher/statistics')}
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                                📊
                            </div>
                            <h3 className="text-xl font-bold text-green-700 mb-2">Thống kê & Báo cáo</h3>
                            <p className="text-gray-600 mb-4 text-sm">Xem tiến độ học tập và kết quả phản tư của học sinh.</p>
                            <button
                                className="text-green-600 font-bold hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/teacher/statistics');
                                }}
                            >
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
