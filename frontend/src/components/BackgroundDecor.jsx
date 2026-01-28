import { useMemo } from 'react';

const BackgroundDecor = () => {
    // Generate random cloud positions
    const clouds = useMemo(() => [
        { id: 1, top: '10%', left: '5%', scale: 1.2, delay: '0s', duration: '20s' },
        { id: 2, top: '25%', right: '8%', scale: 0.8, delay: '5s', duration: '25s' },
        { id: 3, top: '60%', left: '-5%', scale: 1.5, delay: '2s', duration: '30s' },
        { id: 4, top: '80%', right: '-2%', scale: 1.0, delay: '8s', duration: '22s' },
        { id: 5, top: '40%', right: '15%', scale: 0.6, delay: '12s', duration: '28s' }, // Thêm mây
    ], []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">

            {/* --- CLOUDS --- */}
            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="absolute opacity-80 animate-float z-30"
                    style={{
                        top: cloud.top,
                        left: cloud.left,
                        right: cloud.right,
                        transform: `scale(${cloud.scale})`,
                        animationDelay: cloud.delay,
                        animationDuration: cloud.duration
                    }}
                >
                    <div className="relative w-32 h-16 bg-white/60 rounded-full flex items-center justify-center">
                        <div className="absolute -top-8 left-4 w-12 h-12 bg-white/60 rounded-full"></div>
                        <div className="absolute -top-12 left-10 w-16 h-16 bg-white/60 rounded-full"></div>
                        <div className="absolute -top-6 right-4 w-10 h-10 bg-white/60 rounded-full"></div>
                    </div>
                </div>
            ))}

            {/* --- TREES (LEFT SIDE) --- */}
            <div className="absolute bottom-0 left-0 flex flex-col items-start space-y-reverse space-y-[-60px] pb-10 z-20">
                {/* Hàng cây dọc bên trái */}
                <SimpleTree scale={1.2} color="bg-emerald-500" />
                <SimpleTree scale={0.9} color="bg-teal-500" delay="1s" />
                <SimpleTree scale={1.1} color="bg-green-600" delay="0.5s" />
                <SimpleTree scale={0.8} color="bg-emerald-400" delay="2s" />
                <SimpleTree scale={1.0} color="bg-teal-600" delay="1.5s" />
            </div>

            {/* --- BUSHES (LEFT BOTTOM CORNER) --- */}
            <div className="absolute bottom-0 left-0 flex items-end -space-x-12 z-20">
                <SimpleTree scale={1.5} color="bg-green-700" delay="0.2s" />
                <SimpleTree scale={1.0} color="bg-emerald-800" delay="1.2s" />
            </div>

            {/* --- TREES (RIGHT SIDE) --- */}
            <div className="absolute bottom-0 right-0 flex flex-col items-end space-y-reverse space-y-[-50px] pb-10 z-20">
                {/* Hàng cây dọc bên phải */}
                <SimpleTree scale={1.3} color="bg-green-500" delay="0.3s" />
                <SimpleTree scale={0.8} color="bg-emerald-600" delay="2.3s" />
                <SimpleTree scale={1.2} color="bg-teal-500" delay="0.7s" />
                <SimpleTree scale={0.9} color="bg-green-400" delay="1.8s" />
            </div>

            {/* --- BUSHES (RIGHT BOTTOM CORNER) --- */}
            <div className="absolute bottom-0 right-0 flex items-end -space-x-10 flex-row-reverse z-20">
                <SimpleTree scale={1.4} color="bg-emerald-700" delay="0.5s" />
                <SimpleTree scale={1.1} color="bg-green-800" delay="1.5s" />
            </div>

            {/* --- DISTANT MOUNTAINS --- */}
            <div className="absolute bottom-0 left-0 w-full h-64 z-[-1]">
                <div className="absolute bottom-0 left-[-10%] w-[60%] h-48 bg-brand-secondary/20 rounded-[100%] blur-xl"></div>
                <div className="absolute bottom-0 right-[-10%] w-[70%] h-64 bg-brand-primary/10 rounded-[100%] blur-2xl"></div>
            </div>
        </div>
    );
};

// Sub-component for a CSS Tree
const SimpleTree = ({ scale = 1, color = "bg-green-500", delay = '0s' }) => (
    <div
        className={`relative ${color} origin-bottom animate-sway`}
        style={{
            transform: `scale(${scale})`,
            width: '120px',
            height: '180px',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            animationDelay: delay
        }}
    >
        {/* Trunk */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-12 bg-amber-800 rounded"></div>

        {/* Leaves Highlight */}
        <div className="absolute top-4 left-4 w-6 h-6 bg-white/20 rounded-full"></div>
        <div className="absolute top-8 right-6 w-4 h-4 bg-white/10 rounded-full"></div>

        {/* Fruits (Random dots) */}
        <div className="absolute top-10 left-8 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
        <div className="absolute top-20 right-10 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
        <div className="absolute top-28 left-1/2 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
    </div>
);

export default BackgroundDecor;
