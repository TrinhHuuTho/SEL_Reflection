import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logIn, forgotPassword } from '../services/authService';
import BackgroundDecor from '../components/BackgroundDecor';

const LoginScreen = ({ onLogin }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // State cho Quên mật khẩu
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotIsLoading, setForgotIsLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            switch (errorParam) {
                case 'auth_failed':
                    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
                    break;
                case 'missing_tokens':
                    setError('Thiếu thông tin xác thực. Vui lòng thử lại.');
                    break;
                case 'callback_error':
                    setError('Lỗi xử lý đăng nhập. Vui lòng thử lại.');
                    break;
                default:
                    setError('Đã xảy ra lỗi không xác định.');
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Gọi API thực tế
            const response = await logIn(email, password);
            
            // Xử lý khi đăng nhập thành công
            if (response.success) {
                const user = response.user;
                
                // Cập nhật trạng thái App (nếu onLogin cần truyền object user)
                if(onLogin) onLogin(user);

                // Redirect based on role
                if (user.role === 'teacher') {
                    navigate('/teacher');
                } else {
                    navigate('/'); // Sinh viên hoặc general
                }
            } else {
                 // Format trả về catch thông thường (có thể không chạy vào đây nếu throw lỗi từ server mã 4xx/5xx)
                 setError(response.message || 'Đăng nhập không thành công.');
            }
        } catch (err) {
            // Server báo lỗi 401, 400 hoặc hệ thống chết
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Email hoặc mật khẩu không chính xác!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setForgotMessage({ text: '', type: '' });
        
        if (!forgotEmail) {
            setForgotMessage({ text: 'Vui lòng nhập email của bạn.', type: 'error' });
            return;
        }

        setForgotIsLoading(true);
        try {
            const res = await forgotPassword(forgotEmail);
            if (res.success) {
                setForgotMessage({ text: res.message || 'Mật khẩu mới đã được gửi đến email của bạn.', type: 'success' });
                // Đóng modal sau một khoảng thời gian
                setTimeout(() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotMessage({ text: '', type: '' });
                }, 3000);
            } else {
                setForgotMessage({ text: res.message || 'Lỗi khi yêu cầu đặt lại mật khẩu.', type: 'error' });
            }
        } catch (error) {
            const errMessage = error.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.';
            setForgotMessage({ text: errMessage, type: 'error' });
        } finally {
            setForgotIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-brand-bg overflow-hidden py-4">
            {/* Tái sử dụng Background Cây & Mây */}
            <BackgroundDecor />

            {/* Login Card Container */}
            <div className="relative z-10 w-full max-w-sm px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-brand-secondary transform hover:scale-[1.01] transition-transform duration-300">

                    {/* Header Image / Icon */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 bg-brand-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <span className="text-5xl animate-bounce">🔑</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-800 mt-10 mb-2">
                        Đăng nhập
                    </h2>
                    <p className="text-gray-500 text-center mb-6 text-sm">
                        Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1 ml-1 text-sm">Email</label>
                            <input
                                type="email"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1 ml-1 text-sm">Mật khẩu</label>
                            <input
                                type="password"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-base font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                "Đăng nhập"
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">HOẶC</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {/* Google Icon SVG */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Đăng nhập bằng Google
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            type="button" 
                            onClick={() => setShowForgotModal(true)} 
                            className="text-brand-primary hover:underline text-sm font-medium focus:outline-none"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
                        <h3 className="text-xl font-black text-brand-text mb-2 text-center">Quên mật khẩu?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi mật khẩu mới cho bạn.
                        </p>

                        {forgotMessage.text && (
                            <div className={`mb-4 p-3 rounded-xl text-center text-sm font-bold ${forgotMessage.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {forgotMessage.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => {
                                    if(forgotIsLoading) return;
                                    setShowForgotModal(false);
                                    setForgotEmail('');
                                    setForgotMessage({ text: '', type: '' });
                                }}
                                disabled={forgotIsLoading}
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleForgotPassword}
                                disabled={forgotIsLoading}
                                className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-secondary transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {forgotIsLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Gửi email"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
