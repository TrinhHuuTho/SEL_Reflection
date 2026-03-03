import { useState, useEffect } from 'react';

const QuestionModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(0); // 0: Hidden, 1: Opening, 2: Review, 3: Success
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            // Simulate opening animation
            setTimeout(() => setStep(2), 100);
        } else {
            setStep(0);
            setSelectedAnswer(null);
        }
    }, [isOpen]);

    const handleAnswer = (idx) => {
        setSelectedAnswer(idx);
        // Fake success delay
        setTimeout(() => {
            setStep(3);
        }, 800);
    };

    const handleClose = () => {
        if (onComplete) onComplete();
        onClose();
    };

    if (!isOpen && step === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`
                relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden
                transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${step >= 2 ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}
            `}>

                {/* Header Decoration */}
                <div className="h-24 bg-brand-primary flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-64 h-64 bg-white/20 rounded-full -top-32 -left-10"></div>
                    <div className="absolute w-32 h-32 bg-white/10 rounded-full bottom-[-20px] right-10"></div>
                    <h2 className="text-3xl font-black text-white z-10 drop-shadow-md">
                        {step === 3 ? "HOÀN THÀNH!" : "THỬ THÁCH #1"}
                    </h2>
                </div>

                <div className="p-8">
                    {step === 3 ? (
                        // SUCCESS VIEW
                        <div className="text-center animate-bounce-short">
                            <div className="text-6xl mb-4">🎉💎🎁</div>
                            <p className="text-xl font-bold text-gray-700 mb-6">
                                Bạn đã nhận được một mảnh kho báu!
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full bg-brand-secondary hover:bg-teal-400 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                Tiếp tục hành trình
                            </button>
                        </div>
                    ) : (
                        // QUESTION VIEW
                        <>
                            <p className="text-lg text-gray-600 font-medium mb-6 text-center">
                                Hôm nay bạn cảm thấy hứng thú nhất với phần nào của bài học?
                            </p>

                            <div className="space-y-3">
                                {[
                                    "Thí nghiệm núi lửa phun trào 🌋",
                                    "Xem video về khủng long 🦖",
                                    "Làm bài tập nhóm sôi nổi 🤝"
                                ].map((ans, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={`
                                            w-full p-4 rounded-xl border-2 text-left font-bold text-lg transition-all
                                            ${selectedAnswer === idx
                                                ? 'bg-brand-accent border-brand-accent text-brand-text scale-105 shadow-lg'
                                                : 'border-gray-200 text-gray-500 hover:border-brand-secondary hover:text-brand-secondary bg-white'
                                            }
                                        `}
                                    >
                                        {ans}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionModal;
