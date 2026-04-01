import { useState, useEffect, useCallback } from "react"
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
import AdminLayout from "./pages/AdminPages/AdminLayout"
import AdminOverview from "./pages/AdminPages/AdminOverview"
import AdminUsersScreen from "./pages/AdminPages/AdminUsersScreen"
import AdminCentersScreen from "./pages/AdminPages/AdminCentersScreen"
import { getUser, setUser as saveUserToStorage } from "./services/localStorageService"
import { getUserInfo } from "./services/userService"
import GoogleCallback from "./pages/GoogleCallback"

function App() {
    // Tự động khôi phục user list từ LocalStorage khi khởi tạo app (F5 lại trang)
    const [user, setUser] = useState(() => getUser());

    const handleLogin = useCallback((userData) => {
        setUser(userData);
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
    }, []);

    // Fetch full user info from server when user exists (e.g., after page reload or refresh token)
    useEffect(() => {
        if (user && user.id) {
            const fetchUserData = async () => {
                try {
                    const response = await getUserInfo();
                    if (response.success && response.data) {
                        // Update both state and localStorage with full user info (including avatar)
                        setUser(response.data);
                        saveUserToStorage(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error);
                    // Continue with existing user data if fetch fails
                }
            };
            fetchUserData();
        }
    }, []); // Run only once on mount

    useEffect(() => {
        const handleAuthLogout = () => {
            console.log('Auth token invalid, logging out...');
            handleLogout();
        };

        window.addEventListener('auth-logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth-logout', handleAuthLogout);
        };
    }, [handleLogout]);

    // Protected Route Wrapper
    // Updated to accept allowed roles
    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!user) {
            return <Navigate to="/login" replace />;
        }

        // If roles are specified, check if user has required role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Role theo chuẩn database trả về: "teacher", "user", "admin"
            if (user.role === 'admin') {
                return <Navigate to="/admin" replace />;
            }
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
                {/* Google OAuth Callback */}
                <Route
                    path="/auth/callback"
                    element={<GoogleCallback onLogin={handleLogin} />}
                />

                {/* Nếu đã có user thì LoginScreen văng về trang chủ tuỳ theo role */}
                <Route 
                    path="/login" 
                    element={
                        user ? (
                           <Navigate to={user.role === 'admin' ? "/admin" : (user.role === 'teacher' ? "/teacher" : "/")} replace />
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
                            <ProfileScreen user={user} setUser={setUser} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/journey/:journeyId"
                    element={
                        <ProtectedRoute allowedRoles={['user', 'Học sinh']}>
                            <MainGameScreen />
                        </ProtectedRoute>
                    }
                />

                {/* Teacher Routes */}
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'Giáo viên']}>
                            <TeacherDashboard user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/classes"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'Giáo viên']}>
                            <ClassManagementScreen user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/journey/:journeyId"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'Giáo viên']}>
                            <JourneyDetailScreen user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/profile"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'Giáo viên']}>
                            <TeacherProfileScreen user={user} setUser={setUser} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/statistics"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'Giáo viên']}>
                            <StatisticsScreen user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminLayout user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminOverview />} />
                    <Route path="users" element={<AdminUsersScreen />} />
                    <Route path="centers" element={<AdminCentersScreen />} />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
