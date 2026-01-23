import { useState } from 'react';
import BackgroundDecor from '../components/BackgroundDecor';

const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Giả lập call API login
        setTimeout(() => {
            if (username.trim().length > 0 && password.length > 0) {
                // Login thành công
                onLogin(username);
            } else {
                setError('Vui lòng nhập tên và mật khẩu nhé!');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-brand-bg overflow-hidden">
            {/* Tái sử dụng Background Cây & Mây */}
            <BackgroundDecor />

            {/* Login Card Container */}
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-brand-secondary transform hover:scale-[1.01] transition-transform duration-300">

                    {/* Header Image / Icon */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <div className="w-32 h-32 bg-brand-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <span className="text-6xl animate-bounce">🔑</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-center text-brand-primary mt-12 mb-2">
                        CỔNG KHÁM PHÁ
                    </h2>
                    <p className="text-gray-500 text-center mb-8 font-medium">
                        Điền mật mã để bắt đầu hành trình!
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <label className="block text-brand-text font-bold mb-2 ml-2">Tên nhà thám hiểm</label>
                            <input
                                type="text"
                                className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-5 py-4 text-lg font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all placeholder:text-blue-200"
                                placeholder="Nhập tên của bạn..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-brand-text font-bold mb-2 ml-2">Mật khẩu bí mật</label>
                            <input
                                type="password"
                                className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-5 py-4 text-lg font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all placeholder:text-blue-200"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 text-red-500 p-3 rounded-xl text-center font-bold animate-pulse">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary hover:bg-red-400 text-white text-xl font-black py-4 rounded-xl shadow-[0_6px_0_rgb(200,50,50)] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ĐANG MỞ CỬA...
                                </span>
                            ) : (
                                "MỞ CỬA THẦN KỲ 🚀"
                            )}

                            {/* Shine Effect */}
                            <div className="absolute top-0 -left-full w-full h-full bg-white/30 skew-x-[-20deg] group-hover:animate-shine"></div>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm font-medium">
                            Quên mật khẩu? Hãy hỏi thầy cô giáo nhé!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
