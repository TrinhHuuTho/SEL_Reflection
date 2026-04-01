import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const AvatarSelector = ({ currentAvatar, onSelectAvatar, onClose, isLoading = false, message = {} }) => {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
    const [avatarList, setAvatarList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAvatars = async () => {
            try {
                // Dynamically load all images from public/img/blooket_icons/
                const imageModules = import.meta.glob('/public/img/blooket_icons/*.png', { 
                    eager: true,
                    query: '?url',
                    import: 'default'
                });

                const loadedAvatars = Object.entries(imageModules).map(([path, url], index) => {
                    // Extract filename from path
                    const filename = path.split('/').pop();
                    const name = filename.replace('.png', '').replace(/[-_]/g, ' ');
                    
                    return {
                        id: index + 1,
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        image: url,
                        type: 'image'
                    };
                });

                if (loadedAvatars.length > 0) {
                    setAvatarList(loadedAvatars);
                } else {
                    // Fallback to emoji if no images found
                    const fallbackAvatars = [
                        { id: 1, name: 'Chick', emoji: '🐤', color: 'bg-yellow-100', type: 'emoji' },
                        { id: 2, name: 'Panda', emoji: '🐼', color: 'bg-gray-100', type: 'emoji' },
                        { id: 3, name: 'Cow', emoji: '🐄', color: 'bg-gray-200', type: 'emoji' },
                        { id: 4, name: 'Cat', emoji: '🐱', color: 'bg-yellow-50', type: 'emoji' },
                        { id: 5, name: 'Tiger', emoji: '🐯', color: 'bg-orange-200', type: 'emoji' },
                        { id: 6, name: 'Pig', emoji: '🐷', color: 'bg-pink-100', type: 'emoji' },
                        { id: 7, name: 'Fox', emoji: '🦊', color: 'bg-orange-100', type: 'emoji' },
                        { id: 8, name: 'Frog', emoji: '🐸', color: 'bg-green-100', type: 'emoji' },
                        { id: 9, name: 'Lion', emoji: '🦁', color: 'bg-amber-100', type: 'emoji' },
                        { id: 10, name: 'Leopard', emoji: '🐆', color: 'bg-yellow-200', type: 'emoji' },
                        { id: 11, name: 'Rabbit', emoji: '🐰', color: 'bg-pink-50', type: 'emoji' },
                        { id: 12, name: 'Bear', emoji: '🐻', color: 'bg-amber-200', type: 'emoji' },
                        { id: 13, name: 'Owl', emoji: '🦉', color: 'bg-orange-100', type: 'emoji' },
                        { id: 14, name: 'Monkey', emoji: '🐵', color: 'bg-amber-100', type: 'emoji' },
                        { id: 15, name: 'Fish', emoji: '🐠', color: 'bg-blue-100', type: 'emoji' },
                        { id: 16, name: 'Dinosaur', emoji: '🦕', color: 'bg-green-200', type: 'emoji' },
                    ];
                    setAvatarList(fallbackAvatars);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error loading avatars:', error);
                // Fallback to emoji
                const fallbackAvatars = [
                    { id: 1, name: 'Chick', emoji: '🐤', color: 'bg-yellow-100', type: 'emoji' },
                    { id: 2, name: 'Panda', emoji: '🐼', color: 'bg-gray-100', type: 'emoji' },
                    { id: 3, name: 'Cow', emoji: '🐄', color: 'bg-gray-200', type: 'emoji' },
                    { id: 4, name: 'Cat', emoji: '🐱', color: 'bg-yellow-50', type: 'emoji' },
                ];
                setAvatarList(fallbackAvatars);
                setLoading(false);
            }
        };

        loadAvatars();
    }, []);

    const handleSelectAvatar = (avatar) => {
        setSelectedAvatar(avatar);
    };

    const handleConfirm = () => {
        if (onSelectAvatar) {
            onSelectAvatar(selectedAvatar);
        }
        onClose();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 pb-24 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-6 flex justify-between items-center border-b-4 border-brand-accent rounded-t-3xl">
                    <h2 className="text-2xl font-black">Chọn Avatar</h2>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Danh sách Avatar</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {avatarList.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => handleSelectAvatar(avatar)}
                                className={`p-4 rounded-2xl transition-all duration-200 border-4 relative ${
                                    selectedAvatar?.name === avatar.name
                                        ? 'border-brand-primary bg-brand-primary/10 shadow-xl z-10'
                                        : 'border-gray-200 hover:border-brand-secondary'
                                }`}
                            >
                                {avatar.type === 'image' ? (
                                    <div className="flex items-center justify-center h-24">
                                        <img
                                            src={avatar.image}
                                            alt={avatar.name}
                                            className="w-full h-full object-contain max-w-20 max-h-20"
                                        />
                                    </div>
                                ) : (
                                    <div className={`text-5xl ${avatar.color} rounded-xl p-3 flex items-center justify-center h-24`}>
                                        {avatar.emoji}
                                    </div>
                                )}
                                <p className="text-xs font-bold text-gray-600 mt-2 text-center truncate">
                                    {avatar.name}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mx-8 p-3 rounded-xl text-center text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {message.text}
                    </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t-4 border-gray-200 p-6 flex justify-end gap-3 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedAvatar || isLoading}
                        className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Xác nhận
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelector;
