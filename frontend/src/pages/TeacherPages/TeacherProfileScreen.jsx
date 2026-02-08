import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecor from '../../components/BackgroundDecor';

const TeacherProfileScreen = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    if (!user) {
        return <div className="text-center mt-20">Vui lòng đăng nhập!</div>;
    }

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Simple Header with Back Button */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Hồ sơ Giáo viên</h1>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="bg-white/90 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white">
                    <div className="bg-brand-primary h-32 relative">
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                                <img
                                    src={user.avatar || "https://i.pravatar.cc/150"}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-8 px-8 text-center">
                        <h2 className="text-2xl font-black text-gray-800 mb-1">{user.full_name}</h2>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-6">
                            {user.role}
                        </span>

                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xl">📧</span>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                                    <p className="text-gray-800 font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xl">📅</span>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Ngày tham gia</p>
                                    <p className="text-gray-800 font-medium">
                                        {new Date(user.created_at || Date.now()).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-secondary transition-all flex items-center justify-center gap-2"
                            >
                                <span>🔒</span> Đổi mật khẩu
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition-all border border-red-100"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 animate-slideUp">
                        <h3 className="text-xl font-black text-gray-800 mb-4 text-center">Đổi mật khẩu</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    alert('Đổi mật khẩu thành công!');
                                    setShowPasswordModal(false);
                                }}
                                className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-secondary transition-all"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProfileScreen;
