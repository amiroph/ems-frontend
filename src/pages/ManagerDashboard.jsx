import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [team, setTeam] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, teamRes, leavesRes] = await Promise.all([
        API.get("/manager/stats"),
        API.get("/manager/team"),
        API.get("/leaves", { params: { status: "pending" } }),
      ]);
      setStats(statsRes.data);
      setTeam(teamRes.data);
      setLeaves(leavesRes.data.slice(0, 5));
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
      setStats(prev => ({ ...prev, pendingLeaves: (prev.pendingLeaves || 1) - 1 }));
    } catch (err) {
      alert("Failed to update");
    }
  };

  const STAT_CARDS = [
    { label: "Team Size", value: stats.teamSize, icon: "👥", color: "#1E3A5F", bg: "#EBF4FF" },
    { label: "Active Members", value: stats.activeMembers, icon: "✅", color: "#276749", bg: "#F0FFF4" },
    { label: "Pending Leaves", value: stats.pendingLeaves, icon: "⏳", color: "#B7791F", bg: "#FFF8E1" },
    { label: "Approved Leaves", value: stats.approvedLeaves, icon: "📋", color: "#2E86AB", bg: "#EBF8FF" },
  ];

  return (
    <Layout>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>
            Manager Dashboard 👔
          </h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            Welcome back, {user?.name}. Here's your team overview.
          </p>
        </div>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ backgroundColor: "#E67E22" }}
        >
          + Request Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: card.bg }}
            >
              {card.icon}
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {loading ? "—" : card.value ?? 0}
            </p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <button
          onClick={() => navigate("/manager/team")}
          className="flex items-center gap-4 p-5 rounded-2xl text-left transition hover:shadow-md"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: "#EBF4FF" }}
          >
            👥
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>View Full Team</p>
            <p className="text-xs mt-0.5" style={{ color: "#718096" }}>See all {stats.teamSize || 0} team members →</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/manager/leave-requests")}
          className="flex items-center gap-4 p-5 rounded-2xl text-left transition hover:shadow-md"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: "#FFF8E1" }}
          >
            📋
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>All Leave Requests</p>
            <p className="text-xs mt-0.5" style={{ color: "#718096" }}>
              {stats.pendingLeaves || 0} pending approval →
            </p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My Team Preview */}
        <div
          className="rounded-2xl"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "#e2e8f0" }}
          >
            <h2 className="font-bold" style={{ color: "#2D3748" }}>My Team</h2>
            <button
              onClick={() => navigate("/manager/team")}
              className="text-sm font-semibold"
              style={{ color: "#2E86AB" }}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center" style={{ color: "#718096" }}>Loading...</div>
          ) : team.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm" style={{ color: "#718096" }}>No team members assigned yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
              {team.slice(0, 5).map(member => (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ backgroundColor: "#27AE60" }}
                    >
                      {member.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{member.name}</p>
                      <p className="text-xs" style={{ color: "#718096" }}>{member.position}</p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{
                      backgroundColor: member.status === "active" ? "#F0FFF4" : "#FFF8E1",
                      color: member.status === "active" ? "#276749" : "#B7791F",
                    }}
                  >
                    {member.status}
                  </span>
                </div>
              ))}
              {team.length > 5 && (
                <div className="px-6 py-3 text-center">
                  <button
                    onClick={() => navigate("/manager/team")}
                    className="text-sm font-semibold"
                    style={{ color: "#2E86AB" }}
                  >
                    +{team.length - 5} more members
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Leave Requests */}
        <div
          className="rounded-2xl"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "#e2e8f0" }}
          >
            <h2 className="font-bold" style={{ color: "#2D3748" }}>Pending Leaves</h2>
            <button
              onClick={() => navigate("/manager/leave-requests")}
              className="text-sm font-semibold"
              style={{ color: "#2E86AB" }}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center" style={{ color: "#718096" }}>Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm font-semibold" style={{ color: "#2D3748" }}>No pending requests</p>
              <p className="text-xs mt-1" style={{ color: "#718096" }}>All leave requests are reviewed</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
              {leaves.map(leave => (
                <div key={leave.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                        style={{ backgroundColor: "#27AE60" }}
                      >
                        {leave.employee_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>
                          {leave.employee_name}
                        </p>
                        <p className="text-xs capitalize" style={{ color: "#718096" }}>
                          {leave.type} ·{" "}
                          {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" — "}
                          {new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        {leave.reason && (
                          <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
                            "{leave.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLeaveStatus(leave.id, "approved")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                        style={{ backgroundColor: "#276749" }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleLeaveStatus(leave.id, "rejected")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80"
                        style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <ManagerLeaveModal
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => { setShowLeaveModal(false); fetchData(); }}
        />
      )}

    </Layout>
  );
}

function ManagerLeaveModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    type: "annual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/leaves", form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0",
    backgroundColor: "#F5F7FA",
    color: "#2D3748",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Request Leave</h2>
          <button onClick={onClose} style={{ color: "#718096", fontSize: "20px" }}>✕</button>
        </div>

        <p className="text-sm mb-5 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#EBF8FF", color: "#2C5282" }}>
          ℹ️ Your leave request will be reviewed and approved by HR.
        </p>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Leave Type
            </label>
            <select
              style={inputStyle}
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Start Date *
            </label>
            <input
              type="date"
              style={inputStyle}
              required
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              End Date *
            </label>
            <input
              type="date"
              style={inputStyle}
              required
              value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Reason <span style={{ color: "#A0AEC0", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              style={{ ...inputStyle, resize: "none" }}
              rows={3}
              placeholder="Brief reason for your leave request..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#E67E22" }}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#F5F7FA", color: "#718096", border: "1px solid #e2e8f0" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}