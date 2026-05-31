import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const STATUS_COLORS = {
  pending: { bg: "#FFF8E1", color: "#B7791F", label: "Pending" },
  approved: { bg: "#F0FFF4", color: "#276749", label: "Approved" },
  rejected: { bg: "#FFF5F5", color: "#C53030", label: "Rejected" },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, leavesRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/leaves"),
      ]);
      setStats(statsRes.data);
      setLeaves(leavesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    { label: "Total Employees", value: stats.totalEmployees, icon: "👥", color: "#1E3A5F", bg: "#EBF4FF" },
    { label: "Active Employees", value: stats.activeEmployees, icon: "✅", color: "#276749", bg: "#F0FFF4" },
    { label: "Departments", value: stats.totalDepartments, icon: "🏢", color: "#2E86AB", bg: "#EBF8FF" },
    { label: "Pending Leaves", value: stats.pendingLeaves, icon: "📋", color: "#B7791F", bg: "#FFF8E1" },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#718096" }}>
          Here's what's happening in your organization today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-6 shadow-sm"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: card.bg }}
            >
              {card.icon}
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>
              {loading ? "—" : card.value ?? 0}
            </p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Add New Employee", icon: "➕", path: "/admin/employees", color: "#1E3A5F" },
          { label: "Manage Departments", icon: "🏢", path: "/admin/departments", color: "#2E86AB" },
          { label: "Review Leaves", icon: "📋", path: "/admin/leaves", color: "#E67E22" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-4 p-5 rounded-2xl text-left transition hover:shadow-md"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: action.color + "15" }}
            >
              {action.icon}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{action.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#718096" }}>Click to manage →</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Leave Requests */}
      <div
        className="rounded-2xl"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="font-bold text-base" style={{ color: "#2D3748" }}>Recent Leave Requests</h2>
          <button
            onClick={() => navigate("/admin/leaves")}
            className="text-sm font-semibold transition hover:opacity-70"
            style={{ color: "#2E86AB" }}
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center" style={{ color: "#718096" }}>Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold" style={{ color: "#2D3748" }}>No leave requests yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
            {leaves.slice(0, 6).map((leave) => {
              const s = STATUS_COLORS[leave.status] || STATUS_COLORS.pending;
              return (
                <div key={leave.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ backgroundColor: "#1E3A5F" }}
                    >
                      {leave.employee_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>
                        {leave.employee_name}
                      </p>
                      <p className="text-xs" style={{ color: "#718096" }}>
                        {leave.department} · {leave.type} leave
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-semibold" style={{ color: "#2D3748" }}>
                        {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" — "}
                        {new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}