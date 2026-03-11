export const KEY_TOKEN = "accessToken";
export const KEY_REFRESH_TOKEN = "refreshToken";
export const KEY_USER = "user";

// --- ACCESS TOKEN ---
export const setToken = (token) => {
    localStorage.setItem(KEY_TOKEN, token);
};

export const getToken = () => {
    return localStorage.getItem(KEY_TOKEN);
};

export const removeToken = () => {
    localStorage.removeItem(KEY_TOKEN);
};

// --- REFRESH TOKEN ---
export const setRefreshToken = (token) => {
    localStorage.setItem(KEY_REFRESH_TOKEN, token);
};

export const getRefreshToken = () => {
    return localStorage.getItem(KEY_REFRESH_TOKEN);
};

export const removeRefreshToken = () => {
    localStorage.removeItem(KEY_REFRESH_TOKEN);
};

// --- USER INFO ---
export const setUser = (user) => {
    localStorage.setItem(KEY_USER, JSON.stringify(user));
};

export const getUser = () => {
    const userStr = localStorage.getItem(KEY_USER);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null; // Trả về null nếu json lỗi
    }
};

export const removeUser = () => {
    localStorage.removeItem(KEY_USER);
};

// --- UTILS ---
// Dọn dẹp sạch sẽ khi User nhấn Đăng xuất
export const clearAuthData = () => {
    removeToken();
    removeRefreshToken();
    removeUser();
};