import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCenter } from '../../services/centerService';
import { getClasses } from '../../services/classService';
import { getCourses } from '../../services/courseService';
import { getNodesByCourse } from '../../services/nodeService';
import { getMembersByClass } from '../../services/classMemberService';
import { getClassProgress } from '../../services/progressService';
import { getStudentReflectionsForCourse } from '../../services/reflectionService';

const StatisticsScreen = ({ user, onLogout }) => {
    const navigate = useNavigate();

    // Selection States
    const [selectedJourneyId, setSelectedJourneyId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Data States for Sidebar
    const [centerClasses, setCenterClasses] = useState([]);
    const [expandedClasses, setExpandedClasses] = useState({});

    // Data States for Main Content
    const [journeyNodes, setJourneyNodes] = useState([]);
    const [studentsData, setStudentsData] = useState([]);

    // Modal Detail States
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [studentReflections, setStudentReflections] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Initial Data Loading (Classes & Journeys for Sidebar tree)
    useEffect(() => {
        const loadInitialData = async () => {
            if (user) {
                try {
                    // Start by checking center
                    const centerRes = await getMyCenter();

                    if (centerRes && centerRes.success && centerRes.data) {
                        // Teacher has center -> Fetch classes
                        const classRes = await getClasses();
                        const myClasses = classRes.data || [];

                        // Fetch journeys for each class
                        const classesWithJourneys = await Promise.all(
                            myClasses.map(async (cls) => {
                                try {
                                    const jrnyRes = await getCourses(cls._id);
                                    return { ...cls, journeys: jrnyRes.data || [] };
                                } catch (e) {
                                    return { ...cls, journeys: [] };
                                }
                            })
                        );

                        setCenterClasses(classesWithJourneys);
                        const initialExpanded = classesWithJourneys.reduce((acc, cls) => ({ ...acc, [cls._id]: true }), {});
                        setExpandedClasses(initialExpanded);
                    }
                } catch (error) {
                    console.error("Lỗi tải Sidebar Data", error);
                }
            }
        };

        loadInitialData();
    }, [user]);

    // When Journey Selection Changes -> Fetch Progress and Students
    useEffect(() => {
        const loadProgressData = async () => {
            if (selectedJourneyId && selectedClassId) {
                try {
                    // 1. Get Nodes order
                    const nodesRes = await getNodesByCourse(selectedJourneyId);
                    const relevantNodes = (nodesRes.data || []).sort((a, b) => a.order - b.order);
                    setJourneyNodes(relevantNodes);

                    // 2. Get Students in the Class
                    const memRes = await getMembersByClass(selectedClassId);
                    const memberships = memRes.data || [];
                    const studentsInClass = memberships.map(m => m.studentId).filter(s => s != null);

                    // 3. Get Real Class Progress Table
                    const progRes = await getClassProgress(selectedJourneyId);
                    const classProgressList = progRes.data || [];

                    // 4. Transform data for UI
                    const mappedData = studentsInClass.map(student => {
                        const progress = classProgressList.find(sp => sp.studentId?._id === student._id);
                        const completedNodes = progress?.completedNodes || [];
                        const completedCount = completedNodes.length;
                        const totalNodes = relevantNodes.length;
                        const percent = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

                        return {
                            student,
                            progress: {
                                completedNodes,
                                totalQuestionsAnswered: progress?.totalQuestionsAnswered || 0,
                                lastActiveAt: progress?.lastActiveAt || null
                            },
                            completedCount,
                            totalNodes,
                            percent
                        };
                    });

                    setStudentsData(mappedData);
                } catch (error) {
                    console.error("Lỗi khi tải báo cáo học tập:", error);
                }
            } else {
                setJourneyNodes([]);
                setStudentsData([]);
            }
        };

        loadProgressData();
    }, [selectedJourneyId, selectedClassId]);

    const toggleClass = (classId) => {
        setExpandedClasses(prev => ({
            ...prev,
            [classId]: !prev[classId]
        }));
    };

    const handleSelectJourney = (clsId, jrnId) => {
        setSelectedClassId(clsId);
        setSelectedJourneyId(jrnId);
    };

    const handleViewDetail = async (studentDat) => {
        setSelectedStudent(studentDat);
        setShowDetailModal(true);
        setIsLoadingDetails(true);
        try {
            // Vác ID đi móc sạch bài giải của Sinh viên trong Hành trình đó
            const ansRes = await getStudentReflectionsForCourse(studentDat.student._id, selectedJourneyId);
            if (ansRes.success) {
                setStudentReflections(ansRes.data || []);
            }
        } catch (e) {
            console.error("Lỗi lấy bài chấm:", e);
            setStudentReflections([]);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setShowDetailModal(false);
        setSelectedStudent(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Thống kê tiến độ</h1>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    Giáo viên: {user?.full_name}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tree View */}
                <div className="w-1/4 min-w-[300px] bg-white border-r border-gray-200 overflow-y-auto p-4 custom-scrollbar">
                    <h2 className="text-gray-500 font-bold uppercase text-xs mb-4 tracking-wider flex items-center justify-between">
                        Danh sách Lớp & Hành trình
                        <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full hidden">
                            {centerClasses.length}
                        </span>
                    </h2>

                    <div className="space-y-4">
                        {centerClasses.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Chưa có lớp học nào
                            </div>
                        ) : (
                            centerClasses.map(cls => (
                                <div key={cls._id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    {/* Class Header */}
                                    <div
                                        className="bg-blue-50/50 p-3 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors select-none"
                                        onClick={() => toggleClass(cls._id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-5 h-5 rounded flex items-center justify-center text-[10px] transition-transform duration-300
                                                ${expandedClasses[cls._id] ? 'bg-brand-primary text-white rotate-90' : 'bg-gray-200 text-gray-500'}
                                            `}>
                                                ▶
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm">{cls.class_name}</h3>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium badge bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                            {cls.journeys?.length || 0}
                                        </span>
                                    </div>

                                    {/* Journey List (Children) */}
                                    <div className={`overflow-hidden transition-all duration-300 ${expandedClasses[cls._id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="bg-white p-2 space-y-1 border-t border-gray-50">
                                            {cls.journeys && cls.journeys.length > 0 ? (
                                                cls.journeys.map(journey => (
                                                    <div
                                                        key={journey._id}
                                                        onClick={() => handleSelectJourney(cls._id, journey._id)}
                                                        className={`
                                                            flex items-center p-2.5 ml-3 rounded-lg cursor-pointer border-l-4 transition-all group relative
                                                            ${selectedJourneyId === journey._id
                                                                ? 'bg-green-50 border-green-500 shadow-sm'
                                                                : 'hover:bg-gray-50 border-transparent hover:border-gray-300'}
                                                        `}
                                                    >
                                                        <span className="text-lg mr-3 opacity-80">🗺️</span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-semibold text-sm truncate ${selectedJourneyId === journey._id ? 'text-green-700' : 'text-gray-700'}`}>
                                                                {journey.title}
                                                            </h4>
                                                        </div>
                                                        {selectedJourneyId === journey._id && (
                                                            <div className="absolute right-2 text-green-500 text-xs">●</div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-center text-xs text-gray-400 italic">
                                                    Chưa có hành trình nào
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-gray-50 overflow-y-auto p-6 scroll-smooth">
                    {selectedJourneyId ? (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fadeIn max-w-5xl mx-auto min-h-[400px]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        📊 Bảng Tiến Độ
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Danh sách học sinh & kết quả học tập
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                    👥 {studentsData.length} Học sinh
                                </span>
                            </div>

                            {studentsData.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center h-64">
                                    <div className="text-5xl mb-4 opacity-50">📭</div>
                                    <p className="text-gray-500 font-medium">Lớp này chưa có học sinh nào.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                                                <th className="p-5 font-bold">Học sinh</th>
                                                <th className="p-5 font-bold text-center w-1/3">Tiến độ tổng quan</th>
                                                <th className="p-5 font-bold text-center">Hoàn thành</th>
                                                <th className="p-5 font-bold text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {studentsData.map((item) => {
                                                // Parse avatar if it's a JSON string
                                                let parsedAvatar = item.student.avatar;
                                                if (typeof parsedAvatar === 'string') {
                                                    try {
                                                        parsedAvatar = JSON.parse(parsedAvatar);
                                                    } catch (e) {
                                                        // Not JSON, keep as string (URL)
                                                    }
                                                }
                                                
                                                return (
                                                <tr key={item.student._id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                {/* Avatar rendering - same logic as Header.jsx */}
                                                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                    {typeof parsedAvatar === 'object' && parsedAvatar?.image ? (
                                                                        <img
                                                                            src={parsedAvatar.image}
                                                                            alt={parsedAvatar.name}
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    ) : typeof parsedAvatar === 'object' && parsedAvatar?.emoji ? (
                                                                        <div className={`w-full h-full flex items-center justify-center text-xl font-bold ${parsedAvatar?.color}`}>
                                                                            {parsedAvatar?.emoji}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-lg">
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${item.percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-800 text-sm group-hover:text-brand-primary transition-colors">{item.student.full_name}</div>
                                                                <div className="text-xs text-gray-400">{item.student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="w-full max-w-xs mx-auto">
                                                            <div className="flex justify-between text-xs mb-1.5 font-bold text-gray-600">
                                                                <span>Đã học</span>
                                                                <span>{item.percent}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                                                <div
                                                                    className={`h-3 rounded-full shadow-sm transition-all duration-1000 ease-out relative ${item.percent === 100 ? 'bg-green-500' : 'bg-brand-primary'}`}
                                                                    style={{ width: `${item.percent}%` }}
                                                                >
                                                                    {/* Shimmer effect */}
                                                                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${item.percent === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                            {item.completedCount} / {item.totalNodes} bài
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button
                                                            onClick={() => handleViewDetail(item)}
                                                            className="px-4 py-2 bg-white border border-gray-200 hover:border-brand-primary hover:text-brand-primary text-gray-600 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 ml-auto"
                                                        >
                                                            <span>👁️</span> Xem chi tiết
                                                        </button>
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <div className="text-6xl mb-6 animate-bounce-slow">👈</div>
                            <h3 className="text-2xl font-bold text-gray-500">Vui lòng chọn một hành trình</h3>
                            <p className="mt-2 text-center text-gray-400 max-w-md">Chọn lớp và hành trình từ danh sách bên trái để xem báo cáo chi tiết.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal (Unchanged style-wise mostly, but kept accessible) */}
            {showDetailModal && selectedStudent && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-slideUp">
                        {/* Modal Header */}
                        <div className="bg-brand-primary p-5 flex justify-between items-center text-white shrink-0 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedStudent.student.avatar}
                                    alt=""
                                    className="w-12 h-12 rounded-full border-2 border-white/50 bg-white"
                                />
                                <div>
                                    <h3 className="text-lg font-bold">{selectedStudent.student.full_name}</h3>
                                    <p className="text-xs text-blue-100 flex items-center gap-1">
                                        <span>📝</span> Chi tiết bài làm
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-full text-2xl leading-none w-10 h-10 flex items-center justify-center transition-colors">&times;</button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto grow bg-gray-50 custom-scrollbar">
                            {isLoadingDetails ? (
                                <div className="text-center p-12 text-gray-500 flex flex-col items-center">
                                    <div className="w-10 h-10 mb-4 border-4 border-gray-200 border-t-brand-primary rounded-full animate-spin"></div>
                                    <p>Đang tải bài nộp của học sinh...</p>
                                </div>
                            ) : journeyNodes.length === 0 ? (
                                <p className="text-center text-gray-500">Hành trình này chưa có bài học nào.</p>
                            ) : (
                                <div className="space-y-6">
                                    {journeyNodes.map((node, index) => {
                                        // Look for reflection(s) of this exact node
                                        const nodeReflections = studentReflections.filter(a => a.nodeId === node._id);
                                        const isCompleted = selectedStudent.progress?.completedNodes?.includes(node._id);

                                        return (
                                            <div key={node._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                                {/* Node Status Indicator */}
                                                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-300 group-hover:bg-gray-400'}`}></div>

                                                <div className="pl-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-800 text-lg">
                                                            <span className="text-gray-400 mr-2 text-base">#{index + 1}</span>
                                                            {node.title}
                                                        </h4>
                                                        {isCompleted ? (
                                                            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                                                                ✅ Hoàn thành
                                                            </span>
                                                        ) : (
                                                            <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                                                                ⏳ Chưa hoàn thành
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="bg-blue-50/50 p-3 rounded-lg mb-3 border border-blue-50">
                                                        <p className="text-sm text-gray-600 italic">"{node.description}"</p>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h5 className="text-xs font-bold text-brand-primary uppercase mb-2 flex items-center gap-1">
                                                            🗣️ Câu trả lời của học sinh
                                                        </h5>
                                                        {nodeReflections.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {nodeReflections.map((ref, idx) => {
                                                                    const questionText = node.questions?.find(q => q._id === ref.questionId || q.id === ref.questionId)?.content || 'Câu hỏi không xác định';
                                                                    return (
                                                                        <div key={ref.id} className="bg-white p-4 rounded-lg border-l-4 border-brand-secondary shadow-sm bg-gradient-to-r from-gray-50 to-white">
                                                                            <p className="text-xs text-brand-primary font-bold mb-1">
                                                                                <span className="opacity-70">Hỏi:</span> {questionText}
                                                                            </p>
                                                                            <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                                                                                <span className="opacity-50 text-xs font-bold mr-1">Đáp:</span> 
                                                                                {ref.content}
                                                                            </p>
                                                                            <p className="text-xs text-gray-400 mt-2 text-right italic border-t border-gray-100 pt-2">
                                                                                Đã nộp: {new Date(ref.createdAt).toLocaleString('vi-VN')}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                                                <p className="text-sm text-gray-400 italic">Học sinh chưa làm bài tập này.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 flex justify-end shrink-0 bg-white rounded-b-2xl">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors border border-gray-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatisticsScreen;
