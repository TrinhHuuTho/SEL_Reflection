import { useState, useEffect, useMemo } from 'react';
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

    // Tính toán pseudo-random hash từ journeyId để chọn Layout cố định cho lớp
    const mapVariant = useMemo(() => {
        if (!journeyId) return 'sine';
        
        const idStr = String(journeyId);
        const hexVal = parseInt(idStr.slice(-4), 16);
        
        const layouts = ['sine', 'zigzag', 'hills', 'random_scatter'];
        const layoutIndex = isNaN(hexVal) ? 0 : hexVal % layouts.length;
        return layouts[layoutIndex];
    }, [journeyId]);

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

            {/* Gamification Header: Back Button, Title, Stats */}
            <div className="w-full max-w-6xl mx-auto px-4 z-50 flex flex-col md:flex-row items-center justify-between mb-8 relative gap-4 md:gap-0">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="bg-white/90 hover:bg-white text-gray-700 px-5 py-2.5 rounded-2xl font-bold backdrop-blur-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 border-2 border-gray-100 self-start md:self-auto"
                >
                    ⬅️<span className="hidden sm:inline"> Quay lại</span>
                </button>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary drop-shadow-sm tracking-wide text-center uppercase absolute left-1/2 -translate-x-1/2 pointer-events-none hidden md:block">
                    {journey?.title || "HÀNH TRÌNH TRI THỨC"}
                </h1>

                {/* Stats (Streak & Gems Mock) */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="flex items-center gap-1.5 bg-orange-100 px-4 py-2 rounded-2xl border-2 border-orange-200 shadow-sm cursor-help hover:scale-105 transition-transform">
                        <span className="text-2xl animate-pulse">🔥</span>
                        <span className="font-extrabold text-orange-600">3 Ngày</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-100 px-4 py-2 rounded-2xl border-2 border-blue-200 shadow-sm cursor-help hover:scale-105 transition-transform">
                        <span className="text-2xl animate-bounce">💎</span>
                        <span className="font-extrabold text-brand-primary">1,500</span>
                    </div>
                </div>
            </div>

            {/* Title for Mobile */}
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary drop-shadow-sm tracking-wide text-center uppercase md:hidden mb-4 px-4">
                {journey?.title || "HÀNH TRÌNH TRI THỨC"}
            </h1>

            {/* Gamified Progress Bar */}
            <div className="w-full max-w-xl mx-auto z-50 px-6 mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    <span>Hành trình</span>
                    <span className="text-brand-primary">{Math.min(progress.current - 1, progress.total)} / {progress.total} chặng</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-gray-300">
                    <div 
                        className="h-full bg-gradient-to-r from-green-400 to-brand-accent rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${(Math.min(progress.current - 1, progress.total) / progress.total) * 100}%` }}
                    >
                        {/* Shimmer effect inside progress bar */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 w-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-full z-10 mt-8">
                <MapPath
                    totalSessions={progress.total}
                    currentSession={progress.current}
                    onNodeClick={handleNodeClick}
                    variant={mapVariant}
                />
            </div>
        </div>
    )
}

export default MainGameScreen;
