
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapPath from '../../components/MapPath';
import QuestionModal from '../../components/QuestionModal';
import BackgroundDecor from '../../components/BackgroundDecor';
import { getCourseById } from '../../services/courseService';
import { getNodesByCourse } from '../../services/nodeService';
import { getMyProgress } from '../../services/progressService';

function MainGameScreen() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const [journey, setJourney] = useState(null);

    const [progress, setProgress] = useState({
        total: 10, // Default fallback
        current: 1
    });

    const [journeyNodes, setJourneyNodes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeNode, setActiveNode] = useState(null);

    useEffect(() => {
        const fetchGameData = async () => {
            if (journeyId) {
                try {
                    // 1. Lấy thông tin Journey (Tên khoá học)
                    const courseRes = await getCourseById(journeyId);
                    if (courseRes.success && courseRes.data) {
                        setJourney(courseRes.data);
                    }

                    // 2. Lấy thông tin các chặng (Nodes)
                    const nodesRes = await getNodesByCourse(journeyId);
                    if (nodesRes.success && nodesRes.data) {
                        const relatedNodes = nodesRes.data;
                        relatedNodes.sort((a, b) => a.order - b.order);
                        
                        setJourneyNodes(relatedNodes);

                        // 3. Lấy Data Progress của bộ não Backend
                        let completedList = [];
                        try {
                            const progRes = await getMyProgress(journeyId);
                            if (progRes.success && progRes.data) {
                                completedList = progRes.data.completedNodes || [];
                            }
                        } catch (e) {
                            console.error("Lỗi tải progress:", e);
                        }

                        // 4. Thuật toán quy đổi Node thành Session
                        // Tìm Node đầu tiên CòN TRỐNG (chưa có ID trong list đã hoàn thành)
                        let currentIndex = 1; 
                        for (let i = 0; i < relatedNodes.length; i++) {
                            if (!completedList.includes(relatedNodes[i]._id)) {
                                currentIndex = i + 1; // Chặng hiện tại
                                break;
                            }
                            // Nếu đã hoàn thành full 100% -> Nhảy lên quá total để Full xanh tất cả Map
                            if (i === relatedNodes.length - 1) {
                                currentIndex = relatedNodes.length + 1;
                            }
                        }

                        setProgress({
                            total: relatedNodes.length > 0 ? relatedNodes.length : 1,
                            current: currentIndex
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu Game:", error);
                }
            }
        };

        fetchGameData();
    }, [journeyId]);

    const handleNextLevel = () => {
        // Logic giả định: Mỗi lần bấm Next -> Character đi đến đích -> Hiện câu hỏi
        // Ở đây mình làm tắt: Mở modal luôn để test
        setShowModal(true);
    };

    const handleModalComplete = () => {
        setShowModal(false);
        // Sau khi trả lời xong mới update progress
        setTimeout(() => {
            setProgress(prev => ({ ...prev, current: Math.min(prev.current + 1, prev.total) }));
        }, 300); // Đợi modal đóng hẳn
    };

    const handleNodeClick = (clickedSessionId) => {
        // clickedSessionId tương thích với số 1, 2, 3.. (Array Index) của MapPath svg chứ không phải Order nữa
        if (clickedSessionId === progress.current) {
            // Mở khoá làm bài
            const thisNode = journeyNodes[clickedSessionId - 1];
            setActiveNode(thisNode);
            setShowModal(true);
        } else if (clickedSessionId < progress.current) {
            alert("✅ Chặng này bạn đã hoàn thành xuất sắc rồi! Hãy đi tiếp nhé.");
        } else {
            alert("🔒 Bạn phải hoàn thành chặng trước đó mới có thể mở khóa chặng này!");
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center py-12 relative overflow-hidden">
            <BackgroundDecor />

            <QuestionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onComplete={handleModalComplete}
                node={activeNode}
            />

            {/* Header: Title & Back Button */}
            <div className="w-full max-w-6xl mx-auto px-4 z-50 flex items-center justify-between mb-4 relative">
                <button
                    onClick={() => navigate('/')}
                    className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl font-bold backdrop-blur-sm shadow-sm transition-all flex items-center gap-2"
                >
                    ⬅️ Quay lại
                </button>

                <h1 className="text-4xl font-black text-brand-primary drop-shadow-lg tracking-wide text-center absolute left-1/2 -translate-x-1/2 w-full pointer-events-none uppercase">
                    {journey?.title || "HÀNH TRÌNH TRI THỨC"}
                </h1>

                {/* Placeholder for right side balance */}
                <div className="w-24"></div>
            </div>

            <p className="text-gray-600 font-medium z-50 bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm shadow mb-4">
                Đã hoàn thành: <span className="font-bold text-brand-primary">{Math.min(progress.current - 1, progress.total)}/{progress.total}</span> chặng Hành Trình
            </p>

            {/* Map Container */}
            <div className="w-full h-full z-10 mt-8">
                <MapPath
                    totalSessions={progress.total}
                    currentSession={progress.current}
                    onNodeClick={handleNodeClick}
                />
            </div>
        </div>
    )
}

export default MainGameScreen;
