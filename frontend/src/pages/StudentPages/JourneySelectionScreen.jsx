import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import JourneyCard from '../../components/JourneyCard';
import BackgroundDecor from '../../components/BackgroundDecor';

// Mock Data
import { user_center } from '../../mocks/user_center';
import { centers } from '../../mocks/centers';
import { class_members } from '../../mocks/class_members';
import { classes } from '../../mocks/classes';
import { journeys } from '../../mocks/journeys';

const JourneySelectionScreen = ({ user }) => {
    const navigate = useNavigate();
    const [center, setCenter] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [availableJourneys, setAvailableJourneys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // 1. Get Center
        const userCenterRelation = user_center.find(uc => uc.userId === user._id);
        if (userCenterRelation) {
            const foundCenter = centers.find(c => c._id === userCenterRelation.centerId);
            setCenter(foundCenter);
        }

        // 2. Get Class
        // Assumption: Mock data ensures one class per student per center logic for now
        // Find linkage in class_members
        const memberRelation = class_members.find(cm => cm.studentId === user._id);
        if (memberRelation) {
            const foundClass = classes.find(c => c._id === memberRelation.classId);
            setClassInfo(foundClass);

            // 3. Get Journeys based on class
            if (foundClass) {
                const classJourneys = journeys.filter(j => j.classId === foundClass._id && j.isActive);
                setAvailableJourneys(classJourneys);
            }
        }

        setLoading(false);
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
