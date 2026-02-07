
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapPath from '../components/MapPath';
import QuestionModal from '../components/QuestionModal';
import BackgroundDecor from '../components/BackgroundDecor';
import { nodes } from '../mocks/nodes';
import { journeys } from '../mocks/journeys';

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

    useEffect(() => {
        if (journeyId) {
            // Find journey
            const foundJourney = journeys.find(j => j._id === journeyId);
            setJourney(foundJourney);

            if (foundJourney) {
                // Find nodes for this journey
                const relatedNodes = nodes.filter(n => n.journeyId === foundJourney._id);
                // Sort by order just in case
                relatedNodes.sort((a, b) => a.order - b.order);

                setJourneyNodes(relatedNodes);

                setProgress({
                    total: relatedNodes.length,
                    current: 1
                });
            }
        }
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

    const handleNodeClick = (nodeId) => {
        // Chỉ cho phép click vào node hiện tại (đang active) để làm bài
        if (nodeId === progress.current) {
            setShowModal(true);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center py-12 relative overflow-hidden">
            <BackgroundDecor />

            <QuestionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onComplete={handleModalComplete}
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

            <p className="text-gray-600 font-medium z-50 bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm">
                Đã hoàn thành: {progress.current - 1}/{progress.total} chặng
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
