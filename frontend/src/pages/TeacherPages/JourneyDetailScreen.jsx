import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import { getNodesByCourse, createNode, updateNode, updateNodesOrder } from '../../services/nodeService';

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
            fetchJourneyDetails();
        }
    }, [journeyId]);

    const fetchJourneyDetails = async () => {
        try {
            // 1. Fetch Tựa đề Khóa học
            const courseRes = await getCourseById(journeyId); 
            if (courseRes.success && courseRes.data) {
                setJourney(courseRes.data);
            }
            
            // 2. Fetch danh sách Nodes
            const nodesRes = await getNodesByCourse(journeyId);
            if (nodesRes.success && nodesRes.data) {
                setJourneyNodes(nodesRes.data);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

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

    const handleAddNewNode = () => {
        const newNode = {
            _id: `temp-${Date.now()}`, // Temporary ID
            courseId: journeyId,
            title: '',
            description: '',
            questions: [],
            /* Order sẽ do Backend tự lo liệu */
            isOpen: false
        };
        setSelectedNode(newNode);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedNode(null);
    };

    // Save function (Create or Update)
    const handleSaveNode = async () => {
        if (!selectedNode.title.trim()) {
            alert("Vui lòng nhập tiêu đề!");
            return;
        }

        try {
            const isNew = selectedNode._id.startsWith('temp-');
            
            if (isNew) {
                const { _id, ...nodeData } = selectedNode;
                const res = await createNode(nodeData);
                if (res.success && res.data) {
                    setJourneyNodes([...journeyNodes, res.data]);
                } else {
                    alert(res.message);
                }
            } else {
                const res = await updateNode(selectedNode._id, selectedNode);
                if (res.success && res.data) {
                    const updatedNodes = journeyNodes.map(n => n._id === selectedNode._id ? res.data : n);
                    setJourneyNodes(updatedNodes);
                } else {
                    alert(res.message);
                }
            }
            closeEditModal();
        } catch (error) {
            console.error("Lỗi khi lưu node:", error);
            alert(error.response?.data?.message || "Đã xảy ra lỗi khi lưu bài học!");
        }
    };

    // Helper functions for dynamic questions
    const handleQuestionTextChange = (index, value) => {
        const newQuestions = [...(selectedNode.questions || [])];
        if (typeof newQuestions[index] === 'string') {
            newQuestions[index] = { content: value };
        } else {
            newQuestions[index] = { ...newQuestions[index], content: value };
        }
        setSelectedNode({ ...selectedNode, questions: newQuestions });
    };

    const handleAddQuestionField = () => {
        setSelectedNode({
            ...selectedNode,
            questions: [...(selectedNode.questions || []), { content: "" }]
        });
    };

    const handleRemoveQuestionField = (index) => {
        const newQuestions = [...(selectedNode.questions || [])];
        newQuestions.splice(index, 1);
        setSelectedNode({ ...selectedNode, questions: newQuestions });
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

        // Update local array with new sequential order
        const reorderedNodes = updatedNodes.map((n, idx) => ({ ...n, order: idx + 1 }));

        setJourneyNodes(reorderedNodes);
        setDraggedNode(null);
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
                                    value={selectedNode.title}
                                    onChange={(e) => setSelectedNode({ ...selectedNode, title: e.target.value })}
                                    placeholder="Nhập tiêu đề bài học..."
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={selectedNode.description}
                                    onChange={(e) => setSelectedNode({ ...selectedNode, description: e.target.value })}
                                    rows={4}
                                    placeholder="Nhập mô tả nội dung..."
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                />
                            </div>

                            {/* Questions Management inside Modal */}
                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Bộ Câu Hỏi</label>
                                    <button
                                        onClick={handleAddQuestionField}
                                        className="text-xs bg-brand-primary text-white px-2 py-1 rounded hover:bg-brand-secondary transition-colors font-semibold"
                                    >
                                        + Thêm câu hỏi
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {(selectedNode.questions || []).map((q, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="bg-gray-100 text-gray-500 font-bold px-3 py-2 rounded-lg flex items-center justify-center border border-gray-200 text-sm">
                                                {idx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={typeof q === 'string' ? q : (q.content || "")}
                                                onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                                                placeholder="Nhập nội dung câu hỏi..."
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-sm"
                                            />
                                            <button
                                                onClick={() => handleRemoveQuestionField(idx)}
                                                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition-colors font-bold border border-red-200 hover:border-red-500 text-sm"
                                                title="Xóa câu hỏi này"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {(!selectedNode.questions || selectedNode.questions.length === 0) && (
                                        <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            Chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi" để bắt đầu.
                                        </p>
                                    )}
                                </div>
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
                    {/* Add Node Button (Visible in Edit Mode) */}
                    {isEditing && (
                        <button
                            onClick={handleAddNewNode}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <span>➕ Thêm Node</span>
                        </button>
                    )}

                    {/* Edit Mode Toggle Button */}
                    <button
                        onClick={async () => {
                            if (isEditing) {
                                // Tắt Edit -> Save To Server Bulk
                                try {
                                    const orderPayload = journeyNodes.map((n) => ({ _id: n._id, order: n.order }));
                                    if (orderPayload.length > 0) {
                                        await updateNodesOrder(journeyId, orderPayload);
                                    }
                                } catch (error) {
                                    console.error("Save reorder failed", error);
                                    alert("Lưu thứ tự thất bại, vui lòng tải lại trang.");
                                }
                            }
                            setIsEditing(!isEditing);
                        }}
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
                                    {node.description || "Chưa có mô tả"}
                                </p>

                                {/* Readonly Questions summary list */}
                                <div className="mt-2 mb-3 pl-3 border-l-2 border-brand-primary/20">
                                    <p className="font-semibold text-[11px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        Bộ câu hỏi 
                                        <span className="bg-brand-primary/10 text-brand-primary px-1.5 rounded-full">{node.questions?.length || 0}</span>
                                    </p>
                                    <ul className="text-sm text-gray-700 list-none space-y-1.5">
                                        {(node.questions || []).map((q, idx) => (
                                            <li key={idx} className="truncate flex items-start gap-2" title={typeof q === 'string' ? q : q.content}>
                                                <span className="text-brand-primary text-[10px] mt-1">▶</span>
                                                <span className="truncate">{typeof q === 'string' ? q : q.content}</span>
                                            </li>
                                        ))}
                                        {(!node.questions || node.questions.length === 0) && (
                                            <li className="text-gray-400 italic text-xs">Chưa cài đặt câu hỏi...</li>
                                        )}
                                    </ul>
                                </div>

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
                                        <span className="text-xs italic text-orange-400 ml-auto flex items-center gap-1">
                                            ✏️ Nhấn để sửa
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
