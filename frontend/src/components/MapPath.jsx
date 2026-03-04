import { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MapPath = ({ totalSessions = 10, currentSession = 1, onNodeClick }) => {
    // Cấu hình bản đồ ngang (Horizontal)
    const CONFIG = {
        HEIGHT: 500,            // Chiều cao tổng
        AMPLITUDE: 100,         // Độ uốn lượn
        GAP: 200,               // Khoảng cách ngang
        START_X: window.innerWidth / 2,           // Bắt đầu ở giữa màn hình
        START_Y: 250,           // Trục giữa
    };

    const containerRef = useRef(null);

    // --- CHARACTER ASSETS (Original Placeholder) ---
    const Character = () => (
        <div className="w-32 h-32 relative -top-24 -left-12 z-50 pointer-events-none transition-all duration-500 ease-in-out">
            <div className="absolute inset-0 animate-bounce">
                {/* Graduation Cap */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <div className="w-16 h-2 bg-indigo-600 rounded-sm shadow-md"></div>
                    <div className="w-10 h-10 bg-indigo-600 rounded-sm mx-auto -mt-1 relative shadow-lg">
                        {/* Tassel */}
                        <div className="absolute -right-1 top-0 w-1 h-8 bg-yellow-400 animate-swing origin-top"></div>
                        <div className="absolute -right-2 top-7 w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </div>
                </div>

                {/* Head */}
                <div className="w-20 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full border-4 border-amber-800 mx-auto relative shadow-xl mt-8">
                    {/* Eyes - excited expression */}
                    <div className="absolute top-7 left-3 w-4 h-5 bg-amber-900 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full mt-1 ml-1 animate-pulse"></div>
                    </div>
                    <div className="absolute top-7 right-3 w-4 h-5 bg-amber-900 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full mt-1 ml-1 animate-pulse"></div>
                    </div>

                    {/* Happy smile */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-10 h-5 border-b-4 border-amber-900 rounded-b-full"></div>

                    {/* Rosy cheeks */}
                    <div className="absolute top-10 left-1 w-4 h-3 bg-red-300/50 rounded-full"></div>
                    <div className="absolute top-10 right-1 w-4 h-3 bg-red-300/50 rounded-full"></div>
                </div>

                {/* Book in hand */}
                <div className="absolute bottom-1 right-1 w-6 h-8 bg-green-500 rounded border-2 border-green-700 shadow-md transform rotate-12">
                    <div className="w-4 h-1 bg-green-700 mx-auto mt-2"></div>
                    <div className="w-4 h-1 bg-green-700 mx-auto mt-1"></div>
                </div>
            </div>

            {/* Shadow */}
            <div className="w-16 h-4 bg-black/20 rounded-[100%] mx-auto mt-2 blur-sm"></div>

            {/* Success sparkles */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-2 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-100"></div>
        </div>
    );

    // Sinh tọa độ các điểm (Horizontal)
    const points = useMemo(() => {
        return Array.from({ length: totalSessions }).map((_, i) => ({
            id: i + 1,
            x: CONFIG.START_X + i * CONFIG.GAP,
            y: CONFIG.START_Y + Math.sin(i * 0.8) * CONFIG.AMPLITUDE * (i % 2 === 0 ? 1 : -1) * 0.5 + Math.sin(i) * CONFIG.AMPLITUDE,
        }));
    }, [totalSessions]);

    // Update status
    const pointsWithStatus = useMemo(() => {
        return points.map(p => ({
            ...p,
            status: p.id < currentSession ? 'completed' : (p.id === currentSession ? 'active' : 'locked')
        }));
    }, [points, currentSession]);

    // SVG Layout
    const totalWidth = CONFIG.START_X + (totalSessions) * CONFIG.GAP;

    // Tạo đường cong SVG
    const pathData = useMemo(() => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            const cp1x = p1.x + CONFIG.GAP * 0.5;
            const cp1y = p1.y;
            const cp2x = p2.x - CONFIG.GAP * 0.5;
            const cp2y = p2.y;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    }, [points]);

    // Auto scroll
    useEffect(() => {
        if (containerRef.current) {
            const activePoint = points[currentSession - 1];
            if (activePoint) {
                const scrollTo = activePoint.x - window.innerWidth / 2;
                containerRef.current.scrollTo({
                    left: Math.max(0, scrollTo),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentSession, points]);

    const handleScroll = (direction) => {
        if (containerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            containerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative w-full h-full group">
            <div
                ref={containerRef}
                className="w-full h-full overflow-x-auto overflow-y-hidden relative no-scrollbar z-0"
                style={{ height: CONFIG.HEIGHT, scrollBehavior: 'smooth' }}
            >
                <svg
                    className="absolute top-0 left-0 overflow-visible pointer-events-none"
                    width={totalWidth}
                    height={CONFIG.HEIGHT}
                    viewBox={`0 0 ${totalWidth} ${CONFIG.HEIGHT}`}
                >
                    {/* REVERTED STYLE: Brand color path */}
                    <path
                        d={pathData}
                        stroke="var(--color-brand-path)"
                        strokeWidth="60"
                        fill="none"
                        strokeLinecap="round"
                        className="drop-shadow-xl"
                    />
                    {/* REVERTED STYLE: Simple dashed line */}
                    <path
                        d={pathData}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="15 15"
                    />
                </svg>

                {/* REVERTED CHECKPOINTS STYLE */}
                {pointsWithStatus.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => onNodeClick && onNodeClick(p.id)}
                        className={`
                        absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center 
                        text-2xl font-black border-4 transition-transform duration-300 z-10 cursor-pointer
                        ${getPointStyles(p.status)}
                    `}
                        style={{
                            left: p.x,
                            top: p.y
                        }}
                    >
                        {p.status === 'completed' ? '⭐' : p.id}

                        {p.status === 'active' && (
                            <span className="absolute w-full h-full rounded-full bg-brand-accent opacity-75 animate-ping -z-10"></span>
                        )}

                        {/* Label dưới chân */}
                        <div className="absolute -bottom-10 w-24 text-center text-sm font-bold text-gray-400 opacity-60">
                            {p.status === 'completed' ? `Buổi ${p.id}` : ''}
                        </div>
                    </div>
                ))}

                {/* Render Character */}
                {points.map((p) => {
                    if (p.id === currentSession) {
                        return (
                            <div
                                key="character"
                                className="absolute transition-all duration-1000 ease-in-out z-20"
                                style={{
                                    left: p.x,
                                    top: p.y
                                }}
                            >
                                <Character />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={() => handleScroll('left')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/50 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 text-brand-primary cursor-pointer border border-white/50"
            >
                <ChevronLeft size={32} strokeWidth={3} />
            </button>

            <button
                onClick={() => handleScroll('right')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/50 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 text-brand-primary cursor-pointer border border-white/50"
            >
                <ChevronRight size={32} strokeWidth={3} />
            </button>
        </div>
    );
};

// REVERTED STYLE HELPER
const getPointStyles = (status) => {
    switch (status) {
        case 'active':
            return 'bg-brand-accent border-white text-white scale-110 shadow-[0_0_20px_rgba(255,230,109,0.8)] cursor-pointer hover:scale-125';
        case 'completed':
            return 'bg-brand-secondary border-brand-secondary text-white';
        default: // locked
            return 'bg-gray-200 border-gray-300 text-gray-400';
    }
};

export default MapPath;
