import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainGameScreen from "./pages/MainGameScreen"
import LoginScreen from "./pages/LoginScreen"
import JourneySelectionScreen from "./pages/JourneySelectionScreen"

function App() {
    // Simple state management for now. 
    // In a real app, use Context or Redux/Zustand.
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    // Protected Route Wrapper
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <JourneySelectionScreen user={user} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/journey/:journeyId"
                    element={
                        <ProtectedRoute>
                            <MainGameScreen />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
