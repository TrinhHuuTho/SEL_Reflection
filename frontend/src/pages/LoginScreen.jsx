import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { users } from '../mocks/users';
import BackgroundDecor from '../components/BackgroundDecor';

const LoginScreen = ({ onLogin }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Giả lập call API login
        setTimeout(() => {
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                if (!user.isActive) {
                    setError('Tài khoản của bạn đã bị khóa!');
                    setIsLoading(false);
                    return;
                }
                // Login thành công
                // Login thành công
                onLogin(user);

                // Redirect based on role
                if (user.role === 'Giáo viên') {
                    navigate('/teacher');
                } else {
                    navigate('/');
                }
            } else {
                setError('Email hoặc mật khẩu không chính xác!');
                setIsLoading(false);
            }
        }, 1000);
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
                            onClick={handleSubmit} // Reusing logic as requested
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                        <a href="#" className="text-brand-primary hover:underline text-sm font-medium">
                            Quên mật khẩu?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
