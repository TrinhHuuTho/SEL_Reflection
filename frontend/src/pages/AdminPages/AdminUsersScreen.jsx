import React, { useState, useEffect } from 'react';
import { registerStudent, registerTeacher } from '../../services/authService';
import { getAllUsers } from '../../services/userService';
import { getAllCenters } from '../../services/centerService';

const AdminUsersScreen = () => {
    // State lưu DB thật
    const [userList, setUserList] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Học sinh'); // Thêm state Tab hiện tại
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        role: 'Học sinh',
        centerId: '', // Thêm trường dữ liệu chọn Trung tâm
    });
    const [centersList, setCentersList] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsFetching(true);
            try {
                // Tải danh sách User song song cùng danh sách chi nhánh Trung tâm (cho hộp Dropdown)
                const [usersRes, centersRes] = await Promise.all([
                    getAllUsers(),
                    getAllCenters()
                ]);

                if (usersRes.success) {
                    setUserList(usersRes.data);
                }
                if (centersRes.success) {
                    setCentersList(centersRes.data || []);
                }
            } catch (error) {
                console.error("Lỗi khi fetch data:", error);
            } finally {
                setIsFetching(false);
            }
        };
        loadInitialData();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        if (!form.full_name || !form.email) return;

        setIsLoading(true);
        try {
            let res;
            if (form.role === 'Học sinh') {
                res = await registerStudent(form.full_name, form.email, 'student', form.centerId);
            } else {
                res = await registerTeacher(form.full_name, form.email, 'teacher', form.centerId);
            }

            if (res.success) {
                const centerNameSelected = centersList.find(c => c._id === form.centerId)?.centerName || 'Chưa gán';

                const newUser = {
                    _id: res.user.id,
                    full_name: res.user.full_name,
                    email: res.user.email,
                    role: form.role === 'Học sinh' ? 'student' : 'teacher',
                    centerName: centerNameSelected,
                    created_at: new Date().toISOString()
                };

                setUserList([newUser, ...userList]); // Update React State
                setMessage({ text: 'Tạo tài khoản thành công! Mật khẩu đã gửi vào email.', type: 'success' });
                
                setTimeout(() => {
                    setShowModal(false);
                    setForm({ full_name: '', email: '', role: 'Học sinh', centerId: '' });
                    setMessage({ text: '', type: '' });
                }, 2000);
            } else {
                setMessage({ text: res.message || 'Lỗi tạo tài khoản', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Lọc danh sách theo Tab hiện tại (hỗ trợ cả tiếng Việt lẫn tiếng Anh nếu có từ db cũ)
    const filteredUsers = userList.filter(u => {
        if (activeTab === 'Giáo viên') {
            return u.role === 'Giáo viên' || u.role === 'teacher';
        }
        return u.role === 'Học sinh' || u.role === 'student' || u.role === 'user';
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-brand-text mb-2">Quản lý Tài khoản</h2>
                    <p className="text-gray-500">Thêm mới và xem danh sách Giáo viên / Học sinh.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/30 flex gap-2 items-center"
                >
                    <span className="text-xl">+</span> Tạo tài khoản
                </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('Học sinh')}
                    className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${
                        activeTab === 'Học sinh' 
                        ? 'border-brand-primary text-brand-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    👨‍🎓 Học sinh
                </button>
                <button
                    onClick={() => setActiveTab('Giáo viên')}
                    className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${
                        activeTab === 'Giáo viên' 
                        ? 'border-brand-primary text-brand-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    👨‍🏫 Giáo viên
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider border-b border-gray-100">
                            <th className="p-4">Họ và Tên</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4">Trung tâm</th>
                            <th className="p-4 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 table-fixed">
                        {isFetching ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    <svg className="animate-spin h-6 w-6 text-brand-primary mx-auto mb-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, idx) => {
                                // Parse avatar if it's a JSON string
                                let parsedAvatar = user.avatar;
                                if (typeof parsedAvatar === 'string') {
                                    try {
                                        parsedAvatar = JSON.parse(parsedAvatar);
                                    } catch (e) {
                                        // Not JSON, keep as string (URL)
                                    }
                                }
                                
                                return (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
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
                                                    <div className={`w-full h-full flex items-center justify-center ${parsedAvatar?.color}`}>
                                                        {parsedAvatar?.emoji}
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-brand-accent/20 flex items-center justify-center font-bold text-brand-primary">
                                                        {user.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-bold text-gray-800">{user.full_name}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                            (user.role === 'Giáo viên' || user.role === 'teacher') 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="max-w-[150px] truncate" title={user.centerName}>
                                                {user.centerName || 'Chưa gán'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-green-500 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">
                                            Đang hoạt động
                                        </span>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {!isFetching && filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-medium">Chưa có dữ liệu {activeTab}.</div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl p-4">
                                <div className="text-center font-bold text-brand-primary flex flex-col items-center">
                                    <svg className="animate-spin h-8 w-8 text-brand-primary mb-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang gửi Email thông báo...
                                </div>
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Tạo Tài khoản mới</h3>
                        
                        {message.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Họ và Tên</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    value={form.full_name}
                                    onChange={e => setForm({...form, full_name: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    disabled={isLoading}
                                    value={form.email}
                                    onChange={e => setForm({...form, email: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Vai trò</label>
                                <select
                                    value={form.role}
                                    disabled={isLoading}
                                    onChange={e => setForm({...form, role: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-bold focus:border-brand-primary focus:outline-none text-gray-700 disabled:opacity-50"
                                >
                                    <option value="Học sinh">Học sinh</option>
                                    <option value="Giáo viên">Giáo viên</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Trực thuộc Trung tâm <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={form.centerId}
                                    disabled={isLoading}
                                    onChange={e => setForm({...form, centerId: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none text-gray-700 disabled:opacity-50"
                                >
                                    <option value="" disabled>-- Hãy Chọn Trung Tâm --</option>
                                    {centersList.map(center => (
                                        <option key={center._id} value={center._id}>{center.centerName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => {
                                        setShowModal(false);
                                        setMessage({ text: '', type: '' });
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-secondary transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Đang tạo...' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersScreen;
