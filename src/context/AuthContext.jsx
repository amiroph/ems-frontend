import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import API from "../utils/api";
import PageLoader from "../components/PageLoader";

const AuthContext = createContext(null);

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE = 60 * 1000; // warn 1 minute before logout

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (!localStorage.getItem("token")) return;

    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);

    // Show warning 1 minute before logout
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_DURATION - WARNING_BEFORE);

    // Auto logout after 10 minutes
    timeoutRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_DURATION);
  }, [logout]);

  // Start timer when user logs in
  useEffect(() => {
    if (user) {
      resetTimer();
      const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
      events.forEach(e => window.addEventListener(e, resetTimer));
      return () => {
        events.forEach(e => window.removeEventListener(e, resetTimer));
        clearTimeout(timeoutRef.current);
        clearTimeout(warningRef.current);
        clearInterval(countdownRef.current);
      };
    }
  }, [user, resetTimer]);

  // Load user from localStorage on app start
  useEffect(() => {
    const saved = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (saved && token) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  if (loading) return <PageLoader />;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}

      {/* Session Warning Modal */}
      {showWarning && user && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="text-5xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#2D3748" }}>
              Session Expiring Soon
            </h3>
            <p className="text-sm mb-4" style={{ color: "#718096" }}>
              You have been inactive. Your session will expire in
            </p>

            {/* Countdown Circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold"
              style={{
                backgroundColor: countdown <= 10 ? "#FFF5F5" : "#FFF8E1",
                color: countdown <= 10 ? "#C53030" : "#B7791F",
                border: `3px solid ${countdown <= 10 ? "#FED7D7" : "#FAD089"}`,
              }}
            >
              {countdown}
            </div>

            <p className="text-xs mb-6" style={{ color: "#A0AEC0" }}>
              Move your mouse or click anywhere to stay logged in
            </p>

            <div className="flex gap-3">
              <button
                onClick={resetTimer}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
                style={{ backgroundColor: "#1E3A5F" }}
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition hover:opacity-80"
                style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);