import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = ({ user, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: '📊 Tổng quan', exact: true },
        { path: '/admin/users', label: '👥 Quản lý Tài khoản', exact: false },
        { path: '/admin/centers', label: '🏢 Quản lý Trung tâm', exact: false },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl flex flex-col z-20">
                <div className="p-6 border-b border-gray-100 text-center">
                    <h1 className="text-2xl font-black text-brand-primary">
                        ADMIN<span className="text-brand-accent">UI</span>
                    </h1>
                    <p className="text-xs text-brand-text font-bold mt-1 tracking-widest uppercase">
                        Hệ thống Quản trị
                    </p>
                </div>

                <div className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
                                    isActive
                                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-brand-text'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                        <img
                            src={user?.avatar || "https://i.pravatar.cc/150?u=admin"}
                            alt="Admin Avatar"
                            className="w-10 h-10 rounded-full border-2 border-brand-primary"
                        />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{user?.full_name || 'Admin'}</p>
                            <p className="text-xs text-gray-400 capitalize truncate">{user?.role || 'admin'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <h2 className="text-lg font-bold text-gray-700">Trang cá nhân quản trị viên</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-500 font-bold px-4 py-2 rounded-lg text-sm transition-all"
                    >
                        Đăng xuất
                    </button>
                </header>

                {/* Content Outlet (Nơi các trang Overview/Users/Centers render vào) */}
                <div className="flex-1 overflow-auto p-8 bg-gray-50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
