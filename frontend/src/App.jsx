import { useState } from "react"
import MainGameScreen from "./pages/MainGameScreen"
import LoginScreen from "./pages/LoginScreen"

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    return (
        <>
            {isLoggedIn ? (
                <MainGameScreen />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </>
    )
}

export default App
