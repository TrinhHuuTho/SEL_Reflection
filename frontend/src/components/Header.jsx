import React from 'react';

const Header = ({ centerName, user }) => {
    return (
        <header className="bg-white/90 backdrop-blur-sm shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50 rounded-b-2xl border-b-4 border-brand-primary/20">
            {/* Left: Center Name */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
                    🏛️
                </div>
                <h1 className="text-xl font-bold text-brand-primary tracking-tight">
                    {centerName || "Trung Tâm Học Tập"}
                </h1>
            </div>

            {/* Right: User Info */}
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-700 leading-tight">
                        {user?.full_name || "Nhà thám hiểm"}
                    </p>
                    <p className="text-xs text-brand-secondary font-semibold">
                        {user?.role || "Học sinh"}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-accent p-0.5 bg-white shadow-sm overflow-hidden">
                    <img
                        src={user?.avatar || "https://i.pravatar.cc/150"}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
