import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "hr") navigate("/hr/dashboard");
      else if (user.role === "manager") navigate("/manager/dashboard");
      else navigate("/employee/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FA" }}>

      {/* Left Panel */}
      <div
        className="hidden md:flex flex-col justify-center items-center w-1/2 px-16"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            🏢
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Employee Management System
          </h1>
          <p className="text-lg opacity-70 text-white max-w-sm">
            Manage your workforce efficiently — employees, departments, leaves, and reports in one place.
          </p>
          <div className="mt-12 flex flex-col gap-4">
            {["Manage Employee Profiles", "Track Leave Requests", "Department Management", "Generate Reports"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "#E67E22", color: "#fff" }}
                >
                  ✓
                </div>
                <span className="text-white opacity-80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8">
        <div
          className="w-full max-w-md rounded-2xl p-10 shadow-lg"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              🏢
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#1E3A5F" }}>EMS Portal</p>
              <p className="text-xs" style={{ color: "#718096" }}>Employee Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: "#2D3748" }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "#718096" }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-5"
              style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 mt-2"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#1E3A5F" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div
            className="mt-8 p-4 rounded-xl text-xs"
            style={{ backgroundColor: "#F5F7FA", border: "1px solid #e2e8f0" }}
          >
            <p className="font-semibold mb-2" style={{ color: "#2D3748" }}>Test Accounts:</p>
            <p style={{ color: "#718096" }}>Admin: admin@ems.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}