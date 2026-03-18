import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainGameScreen from "./pages/StudentPages/MainGameScreen"
import LoginScreen from "./pages/LoginScreen"
import JourneySelectionScreen from "./pages/StudentPages/JourneySelectionScreen"
import ProfileScreen from "./pages/StudentPages/ProfileScreen"
import TeacherDashboard from "./pages/TeacherPages/TeacherDashboard"
import ClassManagementScreen from "./pages/TeacherPages/ClassManagementScreen"
import JourneyDetailScreen from "./pages/TeacherPages/JourneyDetailScreen"
import TeacherProfileScreen from "./pages/TeacherPages/TeacherProfileScreen"
import StatisticsScreen from "./pages/TeacherPages/StatisticsScreen"
import { getUser } from "./services/localStorageService"

function App() {
    // Tự động khôi phục user list từ LocalStorage khi khởi tạo app (F5 lại trang)
    const [user, setUser] = useState(() => getUser());

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
            // Role theo chuẩn database trả về: "teacher" và "user"
            if (user.role === 'teacher') {
                return <Navigate to="/teacher" replace />;
            }
            if (user.role === 'user' || user.role === 'Học sinh') {
                return <Navigate to="/" replace />;
            }
        }

        return children;
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Nếu đã có user thì LoginScreen văng về trang chủ tuỳ theo role */}
                <Route 
                    path="/login" 
                    element={
                        user ? (
                           <Navigate to={user.role === 'teacher' ? "/teacher" : "/"} replace />
                        ) : (
                           <LoginScreen onLogin={handleLogin} />
                        )
                    } 
                />

                {/* Student Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute allowedRoles={['user', 'Học sinh']}>
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

                <Route
                    path="/teacher/statistics"
                    element={
                        <ProtectedRoute allowedRoles={['Giáo viên']}>
                            <StatisticsScreen user={user} onLogout={handleLogout} />
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
