import { useState } from 'react';
import MapPath from '../components/MapPath';
import QuestionModal from '../components/QuestionModal';
import BackgroundDecor from '../components/BackgroundDecor';

function MainGameScreen() {
    const [progress, setProgress] = useState({
        total: 8,
        current: 1
    });

    const [showModal, setShowModal] = useState(false);

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

    const handlePrevLevel = () => {
        setProgress(prev => ({ ...prev, current: Math.max(prev.current - 1, 1) }));
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center py-12 relative overflow-hidden">
            <BackgroundDecor />

            <QuestionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onComplete={handleModalComplete}
            />

            <h1 className="text-5xl font-black text-brand-primary drop-shadow-lg tracking-wide text-center z-10 mb-4">
                HÀNH TRÌNH TRI THỨC
            </h1>

            <p className="text-gray-600 font-medium z-10 bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm">
                Đã hoàn thành: {progress.current - 1}/{progress.total} chặng
            </p>

            {/* Map Container */}
            <div className="w-full max-w-2xl px-4 z-0">
                <MapPath totalSessions={progress.total} currentSession={progress.current} />
            </div>

            {/* Debug Controls */}
            <div className="fixed bottom-4 left-4 z-50 bg-black/50 p-2 rounded-lg backdrop-blur-md text-white">
                <p className="text-xs mb-1 font-mono text-gray-300">DEBUG MODE</p>
                <div className="flex gap-2">
                    <button onClick={handlePrevLevel} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-sm">
                        PREV
                    </button>
                    <button onClick={handleNextLevel} className="bg-brand-accent text-brand-text px-3 py-1 rounded hover:bg-yellow-300 text-sm font-bold">
                        NEXT STEP
                    </button>
                </div>
            </div>

            {/* Action Bar (Optional) */}
            <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur p-4 border-t border-brand-secondary/30 flex justify-center z-40">
                <button className="bg-brand-primary hover:bg-red-400 text-white text-lg px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95">
                    Mở ba lô hành trang 🎒
                </button>
            </div>
        </div>
    )
}

export default MainGameScreen
