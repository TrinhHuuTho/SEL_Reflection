import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainGameScreen from "./pages/StudentPages/MainGameScreen"
import LoginScreen from "./pages/LoginScreen"
import JourneySelectionScreen from "./pages/StudentPages/JourneySelectionScreen"
import ProfileScreen from "./pages/StudentPages/ProfileScreen"
import TeacherDashboard from "./pages/TeacherPages/TeacherDashboard"
import ClassManagementScreen from "./pages/TeacherPages/ClassManagementScreen"
import JourneyDetailScreen from "./pages/TeacherPages/JourneyDetailScreen"
import TeacherProfileScreen from "./pages/TeacherPages/TeacherProfileScreen"

function App() {
    // Simple state management for now. 
    // In a real app, use Context or Redux/Zustand.
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    // Protected Route Wrapper
    // Updated to accept allowed roles
    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!user) {
            return <Navigate to="/login" replace />;
        }

        // If roles are specified, check if user has required role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // If teacher tries to access student pages -> redirect to /teacher
            if (user.role === 'Giáo viên') {
                return <Navigate to="/teacher" replace />;
            }
            // If student tries to access teacher pages -> redirect to /
            if (user.role === 'Học sinh') {
                return <Navigate to="/" replace />;
            }
        }

        return children;
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />

                {/* Student Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute allowedRoles={['Học sinh']}>
                            <JourneySelectionScreen user={user} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfileScreen user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/journey/:journeyId"
                    element={
                        <ProtectedRoute allowedRoles={['Học sinh']}>
                            <MainGameScreen />
                        </ProtectedRoute>
                    }
                />

                {/* Teacher Routes */}
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRoles={['Giáo viên']}>
                            <TeacherDashboard user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/classes"
                    element={
                        <ProtectedRoute allowedRoles={['Giáo viên']}>
                            <ClassManagementScreen user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/journey/:journeyId"
                    element={
                        <ProtectedRoute allowedRoles={['Giáo viên']}>
                            <JourneyDetailScreen user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/profile"
                    element={
                        <ProtectedRoute allowedRoles={['Giáo viên']}>
                            <TeacherProfileScreen user={user} onLogout={handleLogout} />
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
