import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { journeys } from '../../mocks/journeys';
import { nodes } from '../../mocks/nodes';

const JourneyDetailScreen = ({ user, onLogout }) => {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const [journey, setJourney] = useState(null);
    const [journeyNodes, setJourneyNodes] = useState([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null); // Node currently being edited in modal
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (journeyId) {
            // 1. Find the journey
            const foundJourney = journeys.find(j => j._id === journeyId);
            setJourney(foundJourney);

            // 2. Filter and sort nodes by order
            const filteredNodes = nodes.filter(n => n.journeyId === journeyId)
                .sort((a, b) => a.order - b.order);
            setJourneyNodes(filteredNodes);
        }
    }, [journeyId]);

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/login');
    };

    const handleEditNodeClick = (node) => {
        if (isEditing) {
            setSelectedNode(node);
            setShowEditModal(true);
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedNode(null);
    };

    // Dummy save function for UI demo
    const handleSaveNode = () => {
        // Logic to update node would go here
        alert(`Đã lưu thay đổi cho node: ${selectedNode.title}`);
        closeEditModal();
    };


    // Drag and Drop State and Handlers
    const [draggedNode, setDraggedNode] = useState(null);

    const handleDragStart = (e, node) => {
        setDraggedNode(node);
        e.dataTransfer.effectAllowed = 'move';
        // Set a transparent drag image or custom style if needed
        // e.dataTransfer.setDragImage(e.target, 0, 0);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();

        if (!draggedNode) return;

        const sourceIndex = journeyNodes.findIndex(n => n._id === draggedNode._id);

        if (sourceIndex === targetIndex) {
            setDraggedNode(null);
            return;
        }

        // Reorder the list
        const updatedNodes = [...journeyNodes];
        const [movedNode] = updatedNodes.splice(sourceIndex, 1);
        updatedNodes.splice(targetIndex, 0, movedNode);

        // Update local state immediately for UI 
        setJourneyNodes(updatedNodes);
        setDraggedNode(null);

        // In a real app, we would also update the 'order' property for each node 
        // and send the new order to the backend here.
    };

    if (!journey) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Edit Modal */}
            {showEditModal && selectedNode && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
                        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Chỉnh sửa Node</h3>
                            <button onClick={closeEditModal} className="hover:bg-white/20 p-1 rounded-full text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    defaultValue={selectedNode.title}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    defaultValue={selectedNode.description}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveNode}
                                    className="px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-secondary transition-colors shadow-sm"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Chi tiết Hành trình</h1>
                        <p className="text-sm text-brand-primary font-medium">{journey.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Edit Mode Toggle Button */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                            ${isEditing
                                ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-1'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {isEditing ? (
                            <>
                                <span>✅ Xong</span>
                            </>
                        ) : (
                            <>
                                <span>✏️ Chỉnh sửa</span>
                            </>
                        )}
                    </button>

                    <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

                    <span className="text-sm font-semibold text-gray-600 hidden md:block">
                        {user?.full_name}
                    </span>
                    <img
                        src={user?.avatar || "https://i.pravatar.cc/150"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border border-gray-200"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                    <div className="p-6 bg-blue-50/50 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{journey.title}</h2>
                        <p className="text-gray-600">{journey.description}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                🔢 {journeyNodes.length} nodes
                            </span>
                            <span className="flex items-center gap-1">
                                📅 Tạo ngày: {new Date(journey.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`space-y-4 relative ${!isEditing ? 'before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-brand-primary before:to-transparent before:opacity-20' : ''}`}>
                    {journeyNodes.map((node, index) => (
                        <div
                            key={node._id}
                            className={`
                                relative flex gap-6 group transition-all duration-300
                                ${isEditing ? 'cursor-move' : ''}
                                ${draggedNode && draggedNode._id === node._id ? 'opacity-50 scale-95' : 'opacity-100'}
                            `}
                            draggable={isEditing}
                            onDragStart={(e) => handleDragStart(e, node)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {/* Timeline connector (Hide in Edit Mode) */}
                            {!isEditing && (
                                <div className="absolute left-0 top-0 ml-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white bg-brand-primary shadow-sm z-10 transition-transform duration-300 group-hover:scale-125"></div>
                            )}

                            {/* Drag Handler (Show in Edit Mode) */}
                            {isEditing && (
                                <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM14 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM14 18a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                                    </svg>
                                </div>
                            )}

                            <div
                                onClick={() => handleEditNodeClick(node)}
                                className={`
                                    flex-1 bg-white p-5 rounded-xl shadow-sm border transition-all duration-300
                                    ${isEditing
                                        ? 'border-orange-200 hover:border-orange-400 cursor-pointer hover:shadow-md hover:-translate-y-1'
                                        : 'border-gray-100 hover:shadow-md cursor-default'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`text-lg font-bold transition-colors ${isEditing ? 'text-orange-600' : 'text-gray-800 group-hover:text-brand-primary'}`}>
                                        {node.title}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        #{node.order}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">
                                    {node.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    {node.isOpen ? (
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                            🟢 Đang mở
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                            🔒 Đã khóa
                                        </span>
                                    )}

                                    {isEditing && (
                                        <span className="text-xs italic text-orange-400 ml-auto">
                                            (Nhấn để sửa)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JourneyDetailScreen;
