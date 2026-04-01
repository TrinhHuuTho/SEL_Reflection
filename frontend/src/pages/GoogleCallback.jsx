import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken, setRefreshToken, setUser } from '../services/localStorageService';
import { getUserInfo } from '../services/userService';

const GoogleCallback = ({ onLogin }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const handleCallback = async () => {
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');
            const error = searchParams.get('error');

            if (error) {
                // Handle error case
                console.error('Google OAuth error:', error);
                navigate('/login?error=auth_failed');
                return;
            }

            if (!accessToken || !refreshToken) {
                console.error('Missing tokens in callback');
                navigate('/login?error=missing_tokens');
                return;
            }

            try {
                // Store tokens
                setToken(accessToken);
                setRefreshToken(refreshToken);

                // Decode user info from access token
                const decodeJWT = (token) => {
                    try {
                        const base64Url = token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        return JSON.parse(jsonPayload);
                    } catch (e) {
                        console.error('Error decoding JWT:', e);
                        return null;
                    }
                };

                const payload = decodeJWT(accessToken);
                if (!payload) {
                    throw new Error('Invalid token');
                }

                const user = {
                    id: payload.id,
                    email: payload.email,
                    role: payload.role
                };

                // Store basic user info in localStorage
                setUser(user);

                // Fetch full user info from server (bao gồm avatar)
                try {
                    const userInfo = await getUserInfo();
                    if (userInfo.success && userInfo.data) {
                        setUser(userInfo.data);
                        // Update app state with full user data
                        if (onLogin) onLogin(userInfo.data);
                    } else {
                        // Fallback to basic user data if full info fetch fails
                        if (onLogin) onLogin(user);
                    }
                } catch (err) {
                    console.error('Error fetching full user info:', err);
                    // Update app state with basic user data
                    if (onLogin) onLogin(user);
                }

                // Redirect based on role
                if (user.role === 'teacher' || user.role === 'Giáo viên') {
                    navigate('/teacher', { replace: true });
                } else if (user.role === 'admin') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (err) {
                console.error('Error processing Google callback:', err);
                navigate('/login?error=callback_error', { replace: true });
            }
        };

        handleCallback();
    }, []); // Empty dependency array to run only once

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý đăng nhập...</h2>
                <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
};

export default GoogleCallback;