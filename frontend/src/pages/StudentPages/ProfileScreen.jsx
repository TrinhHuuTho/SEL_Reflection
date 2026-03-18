import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BackgroundDecor from '../../components/BackgroundDecor';
import { clearAuthData } from '../../services/localStorageService';
import { changePassword } from '../../services/authService';

const ProfileScreen = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    // Các state quản lý đổi mật khẩu
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!user) {
        return <div className="text-center mt-20">Vui lòng đăng nhập!</div>;
    }

    const handleLogout = () => {
        // Xoá mọi dữ liệu đăng nhập lưu dưới LocalStorage
        clearAuthData();
        
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    const handleChangePassword = async () => {
        setMessage({ text: '', type: '' });

        if (!oldPassword || !newPassword || !confirmPassword) {
            setMessage({ text: 'Vui lòng điền đầy đủ các thông tin.', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Mật khẩu mới và xác nhận không khớp.', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            const res = await changePassword(user.email, oldPassword, newPassword);
            if (res.success) {
                setMessage({ text: 'Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau 2 giây...', type: 'success' });
                // Thay vì đóng vòng nhập thì gọi hàm logout
                setTimeout(() => {
                    handleLogout();
                }, 2000);
            } else {
                setMessage({ text: res.message || 'Lỗi khi đổi mật khẩu.', type: 'error' });
            }
        } catch (error) {
            const errMessage = error.response?.data?.message || 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.';
            setMessage({ text: errMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (isLoading) return;
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage({ text: '', type: '' });
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden">
            <BackgroundDecor />

            {/* Reuse Header but maybe without centerName if not passed, or passed from parent */}
            <Header user={user} />

            <div className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="bg-white/80 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
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
                        <h2 className="text-2xl font-black text-brand-text mb-1">{user.full_name}</h2>
                        <span className="inline-block bg-brand-accent/20 text-brand-secondary text-xs font-bold px-3 py-1 rounded-full mb-6">
                            {user.role}
                        </span>

                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                <span className="text-xl">📧</span>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                                    <p className="text-brand-text font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                <span className="text-xl">📅</span>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Ngày tham gia</p>
                                    <p className="text-brand-text font-medium">
                                        {user.created_at 
                                            ? new Date(user.created_at).toLocaleDateString('vi-VN') 
                                            : 'Đang cập nhật...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-all"
                            >
                                🔒 Đổi mật khẩu
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition-all"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
                        <h3 className="text-xl font-black text-brand-text mb-4 text-center">Đổi mật khẩu bảo vệ</h3>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-xl text-center text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleCloseModal}
                                disabled={isLoading}
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isLoading}
                                className="flex-1 bg-brand-accent text-brand-text font-bold py-3 rounded-xl shadow-lg shadow-brand-accent/20 hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
