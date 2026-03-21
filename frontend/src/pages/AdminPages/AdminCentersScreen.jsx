import React, { useState, useEffect } from 'react';
import { getAllCenters, createCenter } from '../../services/centerService';

const AdminCentersScreen = () => {
    const [centerList, setCenterList] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        centerName: '',
        address: '',
        description: '',
        hotline: ''
    });

    useEffect(() => {
        const loadCenters = async () => {
            setIsFetching(true);
            try {
                const res = await getAllCenters();
                if (res.success) {
                    setCenterList(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi fetch centers:", error);
            } finally {
                setIsFetching(false);
            }
        };
        loadCenters();
    }, []);

    const handleAddCenter = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        if(!form.centerName || !form.address) return;

        setIsLoading(true);
        try {
            const res = await createCenter({
                centerName: form.centerName,
                address: form.address,
                description: form.description,
                hotline: form.hotline
            });

            if (res.success) {
                const newCenter = res.data;
                setCenterList([newCenter, ...centerList]);
                setMessage({ text: 'Tạo trung tâm thành công!', type: 'success' });
                
                setTimeout(() => {
                    setShowModal(false);
                    setForm({ centerName: '', address: '', description: '', hotline: '' });
                    setMessage({ text: '', type: '' });
                }, 1500);
            } else {
                setMessage({ text: res.message || 'Lỗi tạo trung tâm', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-brand-text mb-2">Quản lý Trung tâm</h2>
                    <p className="text-gray-500">Thêm mới và xem danh sách các địa điểm hoạt động.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/30 flex gap-2 items-center"
                >
                    <span className="text-xl">+</span> Tạo trung tâm
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider border-b border-gray-100">
                            <th className="p-4 w-1/3">Tên Trung tâm</th>
                            <th className="p-4 w-1/2">Địa chỉ</th>
                            <th className="p-4 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isFetching ? (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                    <svg className="animate-spin h-6 w-6 text-brand-primary mx-auto mb-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải dữ liệu trung tâm...
                                </td>
                            </tr>
                        ) : (
                            centerList.map((c, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-500 text-lg">
                                                🏢
                                            </div>
                                            <p className="font-bold text-gray-800">{c.centerName}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <p>{c.address}</p>
                                        {(c.hotline || c.description) && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {c.hotline && <span className="font-bold text-gray-500">HL: {c.hotline} </span>}
                                                {c.description && <span className="italic"> ({c.description})</span>}
                                            </p>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${c.isActive ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                                            {c.isActive ? 'Đang Mở' : 'Ngưng Hoạt Động'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {!isFetching && centerList.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-medium">Chưa có dữ liệu phòng trung tâm.</div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl p-4">
                                <div className="text-center font-bold text-indigo-500 flex flex-col items-center">
                                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tạo trung tâm...
                                </div>
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Tạo Trung tâm mới</h3>
                        
                        {message.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAddCenter} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Tên Cơ sở / Trung tâm</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    placeholder="VD: Trung Tâm Nam Hoà"
                                    value={form.centerName}
                                    onChange={e => setForm({...form, centerName: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Địa chỉ</label>
                                <textarea
                                    required
                                    disabled={isLoading}
                                    rows="2"
                                    placeholder="Số 123 Đường XYZ..."
                                    value={form.address}
                                    onChange={e => setForm({...form, address: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none resize-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Số Hotline</label>
                                <input
                                    type="text"
                                    disabled={isLoading}
                                    placeholder="VD: 0901234567"
                                    value={form.hotline}
                                    onChange={e => setForm({...form, hotline: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Mô tả thêm</label>
                                <textarea
                                    rows="2"
                                    disabled={isLoading}
                                    placeholder="Mô tả về trung tâm..."
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:border-brand-primary focus:outline-none resize-none disabled:opacity-50"
                                />
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
                                    className="flex-1 bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                                >
                                    {isLoading ? 'Đang tạo...' : 'Lưu trung tâm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCentersScreen;
