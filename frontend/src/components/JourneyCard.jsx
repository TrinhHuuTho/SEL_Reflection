import React from 'react';

const JourneyCard = ({ journey, onClick }) => {
    // Mapping background theme to colors/gradients
    const getThemeStyles = (theme) => {
        switch (theme) {
            case 'math_theme':
                return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700 shadow-blue-200';
            case 'science_theme':
                return 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-700 shadow-emerald-200';
            case 'english_theme':
                return 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-700 shadow-purple-200';
            default:
                return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-700 shadow-gray-200';
        }
    };

    const themeClass = getThemeStyles(journey.backgroundValue);

    return (
        <div
            onClick={onClick}
            className={`
                relative h-48 rounded-2xl p-5 cursor-pointer 
                transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 
                shadow-lg hover:shadow-xl border-b-[6px] text-white overflow-hidden group
                ${themeClass}
            `}
        >
            {/* Decor Circles */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            <div className="absolute bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 delay-100"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-xs font-bold mb-2 border border-white/20">
                        HÀNH TRÌNH
                    </div>
                    <h3 className="text-2xl font-black leading-tight drop-shadow-md">
                        {journey.title}
                    </h3>
                    <p className="text-white/90 text-sm mt-1 font-medium line-clamp-2">
                        {journey.description}
                    </p>
                </div>

                <div className="flex justify-end">
                    <button className="bg-white text-gray-800 px-4 py-2 rounded-xl text-xs font-black shadow-md group-hover:bg-brand-accent group-hover:text-brand-text transition-colors">
                        BẮT ĐẦU 🚀
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JourneyCard;
