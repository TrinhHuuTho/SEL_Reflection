import { useState, useEffect } from 'react';
import { createReflection, getReflectionsByNode } from '../services/reflectionService';

const QuestionModal = ({ isOpen, onClose, onComplete, node }) => {
    const [step, setStep] = useState(0); // 0: Hidden, 1: Opening, 2: Open-Ended Question, 3: Success
    const questionsList = node?.questions || [];
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for Peer Answers (Right Side)
    const [peerAnswers, setPeerAnswers] = useState([]);
    const [isLoadingPeers, setIsLoadingPeers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setAnswers(questionsList.map(() => ""));
            setCurrentQIdx(0);
            
            // Fetch Peer Reflections right away
            if (node?._id) {
                setIsLoadingPeers(true);
                getReflectionsByNode(node._id)
                    .then(res => {
                        if (res.success && res.data?.peerReflections) {
                            setPeerAnswers(res.data.peerReflections);
                        }
                    })
                    .catch(err => console.error("Lỗi lấy bài bạn bè:", err))
                    .finally(() => setIsLoadingPeers(false));
            }

            // Simulate opening animation
            setTimeout(() => setStep(2), 100);
        } else {
            setStep(0);
            setAnswers([]);
            setCurrentQIdx(0);
            setPeerAnswers([]);
        }
    }, [isOpen, node?._id]);

    const handleSubmit = async () => {
            if (questionsList.length === 0) {
                setStep(3);
                return;
            }

            const currentAnswer = answers[currentQIdx];
            if (!currentAnswer || !currentAnswer.trim()) {
                alert("Vui lòng nhập câu trả lời của bạn!");
                return;
            }

            setIsSubmitting(true);
            try {
                await createReflection({
                    nodeId: node._id,
                    questionId: questionsList[currentQIdx]?._id, // Truyền ID thay vì Text
                    content: currentAnswer
                });
                
                if (currentQIdx < questionsList.length - 1) {
                    // Sang câu tiếp theo
                    setCurrentQIdx(prev => prev + 1);
                } else {
                    // Hoàn thành tất cả
                    setStep(3);
                }
            } catch (error) {
                console.error("Lỗi khi gửi câu trả lời:", error);
                
                // Trường hợp người dùng bị lỗi do trùng (duplicate answer)
                if (error.response?.status === 409 || error.response?.data?.message?.includes('11000')) {
                    alert("Bạn đã từng trả lời câu này rồi! Hệ thống sẽ duyệt qua câu tiếp theo.");
                    if (currentQIdx < questionsList.length - 1) {
                        setCurrentQIdx(prev => prev + 1);
                    } else {
                        setStep(3);
                    }
                } else {
                    alert(error.response?.data?.message || "Opps! Gửi bài thất bại rồi.");
                }
            } finally {
                setIsSubmitting(false);
            }
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
                relative bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row
                transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${step >= 2 ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}
            `}>

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 md:hidden bg-gray-100 rounded-full p-2 text-gray-500"
                >
                    ✖
                </button>

                {/* LEFT SIDE (70%) - Question & Input */}
                <div className="w-full md:w-[70%] h-full bg-white flex flex-col p-6 md:p-10 relative overflow-y-auto">
                    {/* Header Decoration for Left Side */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

                    {step === 3 ? (
                        // SUCCESS VIEW
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-bounce-short">
                            <div className="text-8xl mb-6">🎉💎🎁</div>
                            <h2 className="text-3xl font-black text-brand-primary mb-4">Tuyệt vời!</h2>
                            <p className="text-xl font-medium text-gray-600 mb-8 max-w-md">
                                Cảm ơn bạn đã chia sẻ suy nghĩ. Bạn đã nhận được một mảnh kho báu!
                            </p>
                            <button
                                onClick={handleClose}
                                className="px-10 py-4 bg-brand-secondary hover:bg-teal-400 text-white text-xl font-bold rounded-2xl shadow-xl shadow-teal-500/30 transition-transform active:scale-95"
                            >
                                Tiếp tục hành trình ➡️
                            </button>
                        </div>
                    ) : (
                        // QUESTION VIEW
                        <div className="flex-1 flex flex-col">
                            <div className="mb-4">
                                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
                                    THỬ THÁCH SUY NGẪM #{node?.order || 1}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                                    {node?.title || "Câu hỏi bí ẩn!"}
                                </h2>
                                <p className="text-gray-500 mt-2 font-medium">{node?.description}</p>
                            </div>

                            <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                {questionsList.length > 0 ? (
                                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 flex-1 flex flex-col transition-all duration-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-bold text-brand-primary text-xl">
                                                Câu {currentQIdx + 1}/{questionsList.length}: 
                                            </p>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
                                            {typeof questionsList[currentQIdx] === 'string' 
                                                ? questionsList[currentQIdx] 
                                                : questionsList[currentQIdx]?.content}
                                        </h3>
                                        
                                        <div className="relative flex-1 flex flex-col">
                                            <textarea
                                                className="w-full flex-1 p-5 bg-white border-2 border-gray-200 rounded-2xl text-lg text-gray-700 font-medium focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none shadow-inner min-h-[160px]"
                                                placeholder="Bắt đầu chia sẻ suy nghĩ của bạn tại đây..."
                                                value={answers[currentQIdx] || ""}
                                                onChange={(e) => {
                                                    const newAns = [...answers];
                                                    newAns[currentQIdx] = e.target.value;
                                                    setAnswers(newAns);
                                                }}
                                                disabled={isSubmitting}
                                            ></textarea>
                                            
                                            {/* Hint tooltip */}
                                            <div className="absolute bottom-4 right-4 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 opacity-70 pointer-events-none">
                                                Không có đáp án đúng/sai
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex-1 flex flex-col items-center justify-center">
                                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                        <p className="font-bold text-gray-500 text-lg">Chặng này không có bài tập nào, bạn có thể đi tiếp!</p>
                                    </div>
                                )}
                            </div>

                            {/* Nút Submit dời xuống dưới Bottom */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                {/* Thanh Tiến Độ Điểm Ảnh */}
                                <div className="flex gap-2.5 pl-2">
                                    {questionsList.map((_, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                                                idx === currentQIdx ? 'w-10 bg-brand-primary shadow-md' : 
                                                idx < currentQIdx ? 'w-2.5 bg-green-400' : 'w-2.5 bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || (questionsList.length > 0 && !(answers[currentQIdx]?.trim()))}
                                    className={`
                                        px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2
                                        ${isSubmitting || (questionsList.length > 0 && !(answers[currentQIdx]?.trim()))
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80'
                                            : 'bg-brand-primary hover:bg-blue-600 active:scale-95 text-white shadow-blue-500/30 transform hover:-translate-y-1'
                                        }
                                    `}
                                >
                                    {isSubmitting ? 'Đang gửi...' : (
                                        questionsList.length === 0 ? 'Hoàn thành chặng ✅' : 
                                        (currentQIdx < questionsList.length - 1 ? 'Nộp và Tới câu tiếp ➡️' : 'Gửi đáp án cuối cùng 🚀')
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE (30%) - Previous Answers */}
                <div className="hidden md:flex w-[30%] h-full bg-blue-50 border-l border-blue-100 flex-col overflow-hidden">
                    <div className="p-6 bg-blue-100/50 border-b border-blue-200">
                        <h3 className="font-black text-brand-primary text-lg uppercase tracking-wider flex items-center gap-2">
                            <span>👀</span> Góc nhìn bạn bè
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoadingPeers ? (
                            <div className="flex flex-col items-center justify-center h-full text-blue-500 opacity-60">
                                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-brand-primary animate-spin mb-3"></div>
                                <p className="text-xs font-bold uppercase tracking-widest">Đang tải...</p>
                            </div>
                        ) : (() => {
                            const currentQuestionId = questionsList[currentQIdx]?._id;
                            const visibleAnswers = peerAnswers.filter(ans => ans.questionId === currentQuestionId && !ans.isPrivate);
                            
                            if (visibleAnswers.length === 0) {
                                return (
                                    <div className="h-full flex flex-col justify-center items-center text-center p-4">
                                        <div className="text-4xl opacity-50 mb-3">🤫</div>
                                        <p className="text-sm font-bold text-gray-400">Chưa có ai trả lời câu hỏi này cả.</p>
                                        <p className="text-xs text-brand-primary mt-1">Hãy là người bình luận đầu tiên!</p>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    {visibleAnswers.map((item) => {
                                        // Parse avatar if it's a JSON string
                                        let parsedAvatar = item.author?.avatar;
                                        if (typeof parsedAvatar === 'string') {
                                            try {
                                                parsedAvatar = JSON.parse(parsedAvatar);
                                            } catch (e) {
                                                // Not JSON, keep as string (URL)
                                            }
                                        }
                                        
                                        return (
                                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* Avatar rendering - same logic as Header.jsx */}
                                                <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                                                    {typeof parsedAvatar === 'object' && parsedAvatar?.image ? (
                                                        <img
                                                            src={parsedAvatar.image}
                                                            alt={parsedAvatar.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : typeof parsedAvatar === 'object' && parsedAvatar?.emoji ? (
                                                        <div className={`w-full h-full flex items-center justify-center ${parsedAvatar?.color}`}>
                                                            {parsedAvatar?.emoji}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-lg">
                                                            👤
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-gray-700 text-sm block truncate group-hover:text-brand-primary transition-colors">
                                                        {item.author?.full_name || "Học sinh Ẩn danh"}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm italic whitespace-pre-wrap">"{item.content}"</p>
                                        </div>
                                        );
                                    })}
                                    <div className="bg-blue-100/30 p-4 rounded-xl text-center border-2 border-dashed border-blue-200">
                                        <p className="text-brand-secondary font-bold text-sm">Và nhiều chia sẻ khác...</p>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default QuestionModal;
