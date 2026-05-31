import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, leavesRes, empRes] = await Promise.all([
        API.get("/hr/stats"),
        API.get("/leaves", { params: { status: "pending" } }),
        API.get("/employees"),
      ]);
      setStats(statsRes.data);
      setLeaves(leavesRes.data.slice(0, 5));
      setEmployees(empRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status });
      setLeaves(prev => prev.filter(l => l.id !== id));
      setStats(prev => ({ ...prev, pendingLeaves: prev.pendingLeaves - 1 }));
    } catch (err) {
      alert("Failed to update leave");
    }
  };

  const STAT_CARDS = [
    { label: "Active Employees", value: stats.totalEmployees, icon: "👥", color: "#1E3A5F", bg: "#EBF4FF" },
    { label: "Pending Leaves", value: stats.pendingLeaves, icon: "📋", color: "#B7791F", bg: "#FFF8E1" },
    { label: "Departments", value: stats.totalDepartments, icon: "🏢", color: "#2E86AB", bg: "#EBF8FF" },
    { label: "New This Month", value: stats.newThisMonth, icon: "🆕", color: "#276749", bg: "#F0FFF4" },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>
          HR Dashboard 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>
          Welcome back, {user?.name}. Here's your HR overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {loading ? "—" : card.value ?? 0}
            </p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Leave Requests */}
        <div className="rounded-2xl" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
            <h2 className="font-bold" style={{ color: "#2D3748" }}>Pending Leave Requests</h2>
            <button onClick={() => navigate("/hr/leaves")}
              className="text-sm font-semibold" style={{ color: "#2E86AB" }}>
              View all →
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center" style={{ color: "#718096" }}>Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm font-semibold" style={{ color: "#2D3748" }}>No pending requests</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
              {leaves.map(leave => (
                <div key={leave.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: "#1E3A5F" }}>
                        {leave.employee_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{leave.employee_name}</p>
                        <p className="text-xs" style={{ color: "#718096" }}>
                          {leave.type} · {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" — "}
                          {new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLeaveStatus(leave.id, "approved")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: "#276749" }}>
                        Approve
                      </button>
                      <button onClick={() => handleLeaveStatus(leave.id, "rejected")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                        Reject
                      </button>
                    </div>
                  </div>
                  {leave.reason && (
                    <p className="text-xs ml-11" style={{ color: "#A0AEC0" }}>"{leave.reason}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Employees */}
        <div className="rounded-2xl" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
            <h2 className="font-bold" style={{ color: "#2D3748" }}>Recent Employees</h2>
            <button onClick={() => navigate("/hr/employees")}
              className="text-sm font-semibold" style={{ color: "#2E86AB" }}>
              View all →
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center" style={{ color: "#718096" }}>Loading...</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
              {employees.map(emp => (
                <div key={emp.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ backgroundColor: "#2E86AB" }}>
                      {emp.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{emp.name}</p>
                      <p className="text-xs" style={{ color: "#718096" }}>{emp.position} · {emp.department}</p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{
                      backgroundColor: emp.status === "active" ? "#F0FFF4" : "#FFF8E1",
                      color: emp.status === "active" ? "#276749" : "#B7791F",
                    }}
                  >
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}