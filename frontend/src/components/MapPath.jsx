import { useMemo } from 'react';

const MapPath = ({ totalSessions = 10, currentSession = 1 }) => {
    // Cấu hình bản đồ
    const CONFIG = {
        WIDTH: 400,       // Chiều rộng ảo của bản đồ
        AMPLITUDE: 120,   // Độ rộng uốn lượn trái phải
        GAP: 150,         // Khoảng cách giữa các điểm
        START_Y: 80,
    };

    // --- CHARACTER ASSETS ---
    // Đây là nơi bạn sẽ tích hợp Rive Component sau này.
    // Hiện tại dùng tạm một div CSS animation.
    const Character = () => (
        <div className="w-32 h-32 relative -top-12 -left-4 z-50 pointer-events-none transition-all duration-500 ease-in-out">
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

    // Sinh tọa độ các điểm dựa trên Sine Wave
    const points = useMemo(() => {
        return Array.from({ length: totalSessions }).map((_, i) => ({
            id: i + 1,
            // X dao động quanh trục giữa, dùng Math.sin
            x: CONFIG.WIDTH / 2 + Math.sin(i) * CONFIG.AMPLITUDE,
            y: CONFIG.START_Y + i * CONFIG.GAP,
            status: i + 1 < currentSession ? 'completed' : (i + 1 === currentSession ? 'active' : 'locked')
        }));
    }, [totalSessions, currentSession]);

    // Tính chiều cao tổng của SVG
    const totalHeight = CONFIG.START_Y + (totalSessions - 1) * CONFIG.GAP + 150;

    // Tạo đường nối SVG (Cubic Bezier Curve)
    const pathData = useMemo(() => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // Điểm điều khiển (Control Points) để tạo đường cong chữ S mềm mại
            // CP1 đi xuống từ P1, CP2 đi lên từ P2
            const cp1x = p1.x;
            const cp1y = p1.y + CONFIG.GAP * 0.5;
            const cp2x = p2.x;
            const cp2y = p2.y - CONFIG.GAP * 0.5;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    }, [points]);

    return (
        <div className="w-full max-w-md mx-auto relative my-12" style={{ height: totalHeight }}>
            {/* Lớp SVG vẽ đường đi */}
            <svg
                className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
                viewBox={`0 0 ${CONFIG.WIDTH} ${totalHeight}`}
                preserveAspectRatio="xMidYMin slice"
            >
                {/* Đường nền (Đất) */}
                <path
                    d={pathData}
                    stroke="var(--color-brand-path)"
                    strokeWidth="60"
                    fill="none"
                    strokeLinecap="round"
                    className="drop-shadow-xl"
                />
                {/* Đường đứt nét trang trí */}
                <path
                    d={pathData}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="15 15"
                />
            </svg>

            {/* Render các điểm Checkpoint */}
            {points.map((p) => (
                <div
                    key={p.id}
                    className={`
                        absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center 
                        text-2xl font-black border-4 transition-transform duration-300
                        ${getPointStyles(p.status)}
                    `}
                    style={{
                        left: `${(p.x / CONFIG.WIDTH) * 100}%`, // Convert to percentage layout
                        top: p.y
                    }}
                >
                    {p.status === 'completed' ? '⭐' : p.id}

                    {/* Hiệu ứng Active Ping */}
                    {p.status === 'active' && (
                        <span className="absolute w-full h-full rounded-full bg-brand-accent opacity-75 animate-ping -z-10"></span>
                    )}
                </div>
            ))}

            {/* --- RENDER CHARACTER --- */}
            {points.map((p) => {
                if (p.id === currentSession) {
                    return (
                        <div
                            key="character"
                            className="absolute transition-all duration-1000 ease-in-out"
                            style={{
                                left: `${(p.x / CONFIG.WIDTH) * 100}%`,
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
    );
};

// Helper style
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
