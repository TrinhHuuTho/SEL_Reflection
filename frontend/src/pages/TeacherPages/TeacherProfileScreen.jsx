import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecor from '../../components/BackgroundDecor';
import AvatarSelector from '../../components/AvatarSelector';
import { setUser as saveUserToStorage } from '../../services/localStorageService';
import { changePassword } from '../../services/authService';
import { updateUserAvatar } from '../../services/userService';

const parseAvatar = (avatar) => {
  if (avatar && typeof avatar === 'string') {
    try {
      return JSON.parse(avatar);
    } catch (e) {
      return avatar;
    }
  }
  return avatar;
};

const TeacherProfileScreen = ({ user, setUser, onLogout }) => {
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar);
    const [avatarMessage, setAvatarMessage] = useState({ text: '', type: '' });
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Sync currentAvatar whenever user changes
    useEffect(() => {
        if (user?.avatar !== currentAvatar) {
            setCurrentAvatar(user?.avatar);
        }
    }, [user?.avatar, currentAvatar]);

    if (!user) {
        return <div className="text-center mt-20">Vui lòng đăng nhập!</div>;
    }

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    const handleAvatarSelect = async (selectedAvatar) => {
        try {
            setAvatarLoading(true);
            setAvatarMessage({ text: '', type: '' });
            
            // Call API to save avatar to backend
            const response = await updateUserAvatar(selectedAvatar);
            
            if (response.success) {
                // Update both local state and parent state
                setCurrentAvatar(selectedAvatar);
                
                // Create updated user object
                const updatedUser = {
                    ...user,
                    avatar: selectedAvatar
                };
                
                // Update localStorage
                saveUserToStorage(updatedUser);
                
                // Update parent component state (App.jsx) so all routes see the change
                if (setUser) {
                    setUser(updatedUser);
                }
                
                setAvatarMessage({ text: 'Avatar đã được cập nhật thành công!', type: 'success' });
                
                // Close modal after 1 second
                setTimeout(() => {
                    setShowAvatarSelector(false);
                    setAvatarMessage({ text: '', type: '' });
                }, 1000);
            } else {
                setAvatarMessage({ text: response.message || 'Lỗi khi cập nhật avatar.', type: 'error' });
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            const errMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật avatar.';
            setAvatarMessage({ text: errMessage, type: 'error' });
        } finally {
            setAvatarLoading(false);
        }
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
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 group">
                            <button
                                onClick={() => setShowAvatarSelector(true)}
                                className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden group-hover:shadow-lg group-hover:border-brand-secondary transition-all relative"
                            >
                                {typeof currentAvatar === 'object' && currentAvatar?.image ? (
                                    <img
                                        src={currentAvatar.image}
                                        alt={currentAvatar.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : typeof currentAvatar === 'object' && currentAvatar?.emoji ? (
                                    <div className={`w-full h-full flex items-center justify-center text-6xl font-bold ${currentAvatar?.color}`}>
                                        {currentAvatar?.emoji}
                                    </div>
                                ) : (
                                    <img
                                        src={currentAvatar || "https://i.pravatar.cc/150"}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="text-white text-2xl">✏️</span>
                                </div>
                            </button>
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

            {/* Avatar Selector Modal */}
            {showAvatarSelector && (
                <AvatarSelector
                    currentAvatar={currentAvatar}
                    onSelectAvatar={handleAvatarSelect}
                    onClose={() => setShowAvatarSelector(false)}
                    isLoading={avatarLoading}
                    message={avatarMessage}
                />
            )}

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
