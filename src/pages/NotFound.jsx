import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    if (!user) navigate("/login");
    else if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "hr") navigate("/hr/dashboard");
    else if (user.role === "manager") navigate("/manager/dashboard");
    else navigate("/employee/dashboard");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-8"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      <div className="text-7xl mb-6">🏢</div>
      <h1 className="text-6xl font-bold mb-3" style={{ color: "#1E3A5F" }}>404</h1>
      <h2 className="text-2xl font-bold mb-3" style={{ color: "#2D3748" }}>Page Not Found</h2>
      <p className="mb-8" style={{ color: "#718096" }}>
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={goHome}
        className="px-8 py-3 rounded-xl text-white font-semibold transition hover:opacity-90"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}