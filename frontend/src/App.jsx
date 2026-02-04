import { useState } from "react"
import MainGameScreen from "./pages/MainGameScreen"
import LoginScreen from "./pages/LoginScreen"
import JourneySelectionScreen from "./pages/JourneySelectionScreen"

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedJourney, setSelectedJourney] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    const handleSelectJourney = (journey) => {
        setSelectedJourney(journey);
    };

    const handleBackToJourneys = () => {
        setSelectedJourney(null);
    }

    // Render logic:
    // 1. Not logged in -> Login Screen
    // 2. Logged in & No Journey selected -> Journey Selection Screen
    // 3. Logged in & Journey selected -> Main Game Screen

    return (
        <>
            {!isLoggedIn ? (
                <LoginScreen onLogin={handleLogin} />
            ) : !selectedJourney ? (
                <JourneySelectionScreen user={user} onSelectJourney={handleSelectJourney} />
            ) : (
                <MainGameScreen journey={selectedJourney} onBack={handleBackToJourneys} />
            )}
        </>
    )
}

export default App
