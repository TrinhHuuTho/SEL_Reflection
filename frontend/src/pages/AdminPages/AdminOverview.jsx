import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import { getAllCenters } from '../../services/centerService';

const AdminOverview = () => {
    const [statsData, setStatsData] = useState({
        studentCount: 0,
        teacherCount: 0,
        centerCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [usersRes, centersRes] = await Promise.all([
                    getAllUsers(),
                    getAllCenters()
                ]);

                let students = 0;
                let teachers = 0;
                let centers = 0;

                if (usersRes.success) {
                    students = usersRes.data.filter(u => u.role === 'Học sinh' || u.role === 'student').length;
                    teachers = usersRes.data.filter(u => u.role === 'Giáo viên' || u.role === 'teacher').length;
                }

                if (centersRes.success) {
                    centers = centersRes.data.length;
                }

                setStatsData({
                    studentCount: students,
                    teacherCount: teachers,
                    centerCount: centers
                });

            } catch (error) {
                console.error("Lỗi fetch dữ liệu Overview:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Học sinh hệ thống', count: statsData.studentCount, icon: '👨‍🎓', color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
        { label: 'Giáo viên', count: statsData.teacherCount, icon: '👨‍🏫', color: 'bg-green-100 text-green-600', border: 'border-green-200' },
        { label: 'Tổng số Trung tâm', count: statsData.centerCount, icon: '🏢', color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-black text-brand-text mb-2">Tổng quan Hệ thống</h2>
                <p className="text-gray-500">Các thống kê dữ liệu mới nhất được cập nhật.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-1">{stat.label}</p>
                                <h3 className="text-4xl font-black text-gray-800">
                                    {isLoading ? <span className="text-gray-300">...</span> : stat.count}
                                </h3>
                            </div>
                            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isLoading ? 'animate-pulse' : ''}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-12">
                <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center text-4xl mb-4 shadow-inner">
                    🚀
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hệ thống đang LIVE</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    Toàn bộ biểu đồ và chỉ số báo cáo trên trang Quản trị viên hiện đang được trích xuất trực tiếp từ cơ sở dữ liệu thật trong thời gian thực.
                </p>
            </div>
        </div>
    );
};

export default AdminOverview;
