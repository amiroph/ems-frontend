import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import LeaveBalance from "../components/LeaveBalance";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, leavesRes] = await Promise.all([
        API.get("/portal/profile"),
        API.get("/portal/stats"),
        API.get("/leaves/my"),
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setLeaves(leavesRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS = {
    pending:  { bg: "#FFF8E1", color: "#B7791F" },
    approved: { bg: "#F0FFF4", color: "#276749" },
    rejected: { bg: "#FFF5F5", color: "#C53030" },
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>
          My Dashboard 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Profile Card */}
      {profile && (
        <div
          className="rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {profile.name?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <p className="opacity-70 text-white text-sm">{profile.position} · {profile.department}</p>
            <p className="opacity-50 text-white text-xs mt-1">{profile.email}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{profile.salary ? `$${parseFloat(profile.salary).toLocaleString()}` : "—"}</p>
              <p className="text-xs opacity-60 text-white mt-1">Annual Salary</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {profile.hire_date
                  ? new Date(profile.hire_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "—"}
              </p>
              <p className="text-xs opacity-60 text-white mt-1">Hire Date</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Leaves", value: stats.totalLeaves, icon: "📋", color: "#1E3A5F", bg: "#EBF4FF" },
          { label: "Pending", value: stats.pendingLeaves, icon: "⏳", color: "#B7791F", bg: "#FFF8E1" },
          { label: "Approved", value: stats.approvedLeaves, icon: "✅", color: "#276749", bg: "#F0FFF4" },
          { label: "Rejected", value: stats.rejectedLeaves, icon: "❌", color: "#C53030", bg: "#FFF5F5" },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
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

      {/* Leave Balance */}
<div className="mb-8">
  <LeaveBalance />
</div>

      {/* Recent Leaves */}
      <div className="rounded-2xl" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="font-bold" style={{ color: "#2D3748" }}>My Leave History</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/employee/leaves")}
              className="text-sm font-semibold" style={{ color: "#2E86AB" }}>
              View all →
            </button>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#E67E22" }}>
              + Apply Leave
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center" style={{ color: "#718096" }}>Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold mb-3" style={{ color: "#2D3748" }}>No leave requests yet</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: "#1E3A5F" }}>
              Apply for Leave
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
            {leaves.map(leave => {
              const s = STATUS_COLORS[leave.status] || STATUS_COLORS.pending;
              return (
                <div key={leave.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm capitalize" style={{ color: "#2D3748" }}>
                      {leave.type} Leave
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#718096" }}>
                      {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" — "}
                      {new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    {leave.reason && (
                      <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>{leave.reason}</p>
                    )}
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    {leave.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => { setShowApplyModal(false); fetchData(); }}
        />
      )}
    </Layout>
  );
}

function ApplyLeaveModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    type: "annual", start_date: "", end_date: "", reason: ""
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
      setError(err.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748",
    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", outline: "none",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: "#ffffff" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Apply for Leave</h2>
          <button onClick={onClose} style={{ color: "#718096", fontSize: "20px" }}>✕</button>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Leave Type</label>
            <select style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Start Date *</label>
            <input type="date" style={inputStyle} required
              value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>End Date *</label>
            <input type="date" style={inputStyle} required
              value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Reason <span style={{ color: "#A0AEC0", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea style={{ ...inputStyle, resize: "none" }} rows={3}
              placeholder="Brief reason for your leave request..."
              value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#E67E22" }}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#F5F7FA", color: "#718096", border: "1px solid #e2e8f0" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}