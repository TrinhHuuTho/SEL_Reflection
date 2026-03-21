import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import JourneyCard from '../../components/JourneyCard';
import BackgroundDecor from '../../components/BackgroundDecor';

import { getMyCenter } from '../../services/centerService';
import { getMyClasses } from '../../services/classMemberService';

// Mock Data
import { journeys } from '../../mocks/journeys';

const JourneySelectionScreen = ({ user }) => {
    const navigate = useNavigate();
    const [center, setCenter] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [availableJourneys, setAvailableJourneys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            // 1. Get Center via API
            try {
                const centerRes = await getMyCenter();
                if (centerRes.success && centerRes.data) {
                    setCenter({ centerName: centerRes.data.centerName, _id: centerRes.data._id });
                }
            } catch (error) {
                console.error("Failed to fetch user center:", error);
            }

            // 2. Get Class via API
            try {
                const classRes = await getMyClasses();
                if (classRes.success && classRes.data && classRes.data.length > 0) {
                    // Cấu trúc mô phỏng: 1 học sinh ở 1 lớp trong 1 trung tâm
                    const foundClass = classRes.data[0];
                    setClassInfo(foundClass);

                    // 3. Get Journeys based on class (Still using Mock)
                    const classJourneys = journeys.filter(j => j.classId === foundClass._id && j.isActive);
                    setAvailableJourneys(classJourneys);
                }
            } catch (error) {
                console.error("Failed to fetch user classes:", error);
            }

            setLoading(false);
        };

        loadData();
    }, [user]);

    if (loading) {
        return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-primary font-bold">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden">
            <BackgroundDecor />

            <Header centerName={center?.centerName} user={user} />

            <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 z-10">

                {/* Greeting Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-brand-primary mb-2">
                        Xin chào, {user?.full_name}! 👋
                    </h2>
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl text-brand-text font-bold border-2 border-white">
                        <span className="text-xl">🏫</span>
                        <h3 className="text-lg">
                            {classInfo ? `Lớp: ${classInfo.class_name}` : "Chưa được phân lớp"}
                        </h3>
                    </div>
                </div>

                {/* Grid Journeys */}
                {availableJourneys.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableJourneys.map(journey => (
                            <JourneyCard
                                key={journey._id}
                                journey={journey}
                                onClick={() => navigate(`/journey/${journey._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 rounded-3xl backdrop-blur-sm">
                        <p className="text-xl text-gray-500 font-bold">Chưa có hành trình nào được mở cho lớp của bạn.</p>
                        <p className="text-sm text-gray-400 mt-2">Hãy quay lại sau nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JourneySelectionScreen;
