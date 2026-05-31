import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";
import LeaveBalance from "../components/LeaveBalance";

const STATUS_STYLES = {
  pending:  { bg: "#FFF8E1", color: "#B7791F", label: "Pending" },
  approved: { bg: "#F0FFF4", color: "#276749", label: "Approved" },
  rejected: { bg: "#FFF5F5", color: "#C53030", label: "Rejected" },
};

const TYPE_STYLES = {
  annual:    { bg: "#EBF8FF", color: "#2C5282" },
  sick:      { bg: "#FFF5F5", color: "#C53030" },
  emergency: { bg: "#FFFAF0", color: "#C05621" },
  unpaid:    { bg: "#F7FAFC", color: "#4A5568" },
};

function daysBetween(start, end) {
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await API.get("/leaves/my");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    setCancelling(id);
    try {
      await API.delete(`/leaves/${id}`);
      setLeaves(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filterStatus
    ? leaves.filter(l => l.status === filterStatus)
    : leaves;

  const counts = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>My Leaves</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            Manage your leave requests
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ backgroundColor: "#E67E22" }}
        >
          + Apply for Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: counts.total, color: "#1E3A5F", bg: "#EBF4FF" },
          { label: "Pending", value: counts.pending, color: "#B7791F", bg: "#FFF8E1" },
          { label: "Approved", value: counts.approved, color: "#276749", bg: "#F0FFF4" },
          { label: "Rejected", value: counts.rejected, color: "#C53030", bg: "#FFF5F5" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Leave Balance */}
<div className="mb-6">
  <LeaveBalance />
</div>

      {/* Filter */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {["", "pending", "approved", "rejected"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition capitalize"
            style={{
              backgroundColor: filterStatus === s ? "#1E3A5F" : "#ffffff",
              color: filterStatus === s ? "#ffffff" : "#718096",
              border: "1px solid #e2e8f0",
            }}
          >
            {s === "" ? `All (${counts.total})` : `${s} (${counts[s]})`}
          </button>
        ))}
      </div>

      {/* Leaves List */}
      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-16 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <p className="text-5xl mb-4">📭</p>
          <p className="font-semibold mb-4" style={{ color: "#2D3748" }}>No leave requests found</p>
          <button onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: "#1E3A5F" }}>
            Apply for Leave
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(leave => {
            const s = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const t = TYPE_STYLES[leave.type] || TYPE_STYLES.annual;
            const days = daysBetween(leave.start_date, leave.end_date);
            return (
              <div key={leave.id} className="rounded-2xl p-6"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: t.bg }}>
                      {leave.type === "annual" ? "🏖️" : leave.type === "sick" ? "🤒" : leave.type === "emergency" ? "🚨" : "💼"}
                    </div>
                    <div>
                      <p className="font-bold capitalize" style={{ color: "#2D3748" }}>
                        {leave.type} Leave
                      </p>
                      <p className="text-sm" style={{ color: "#718096" }}>
                        {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" — "}
                        {new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{days} day{days > 1 ? "s" : ""}
                      </p>
                      {leave.reason && (
                        <p className="text-xs mt-1" style={{ color: "#A0AEC0" }}>"{leave.reason}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {leave.reviewed_by_name && (
                      <p className="text-xs" style={{ color: "#A0AEC0" }}>
                        by {leave.reviewed_by_name}
                      </p>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    {leave.status === "pending" && (
                      <button
                        onClick={() => handleCancel(leave.id)}
                        disabled={cancelling === leave.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                        style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                        {cancelling === leave.id ? "..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ApplyLeaveModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchLeaves(); }}
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
    const [balance, setBalance] = useState(null);
    const [requestedDays, setRequestedDays] = useState(0);
  
    useEffect(() => {
      fetchBalance();
    }, []);
  
    useEffect(() => {
      if (form.start_date && form.end_date) {
        const start = new Date(form.start_date);
        const end = new Date(form.end_date);
        if (end >= start) {
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          setRequestedDays(days);
        } else {
          setRequestedDays(0);
        }
      }
    }, [form.start_date, form.end_date]);
  
    const fetchBalance = async () => {
      try {
        const res = await API.get("/portal/leave-balance");
        setBalance(res.data);
      } catch (err) {
        console.error(err);
      }
    };
  
    const isAnnual = form.type === "annual";
    const notEnoughDays = isAnnual && balance && requestedDays > balance.availableDays;
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      if (notEnoughDays) {
        setError(`Not enough annual leave days. You have ${balance.availableDays} days available but requested ${requestedDays} days.`);
        return;
      }
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
        <div className="w-full max-w-md rounded-2xl p-8 max-h-screen overflow-y-auto"
          style={{ backgroundColor: "#ffffff" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Apply for Leave</h2>
            <button onClick={onClose} style={{ color: "#718096", fontSize: "20px" }}>✕</button>
          </div>
  
          {/* Balance Summary */}
          {balance && (
            <div
              className="rounded-xl p-4 mb-5"
              style={{ backgroundColor: "#EBF4FF", border: "1px solid #BEE3F8" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "#2C5282" }}>
                🏖️ Annual Leave Balance {balance.currentYear}
              </p>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#4A5568" }}>Available:</span>
                <span className="font-bold" style={{ color: balance.availableDays === 0 ? "#C53030" : "#276749" }}>
                  {balance.availableDays} / {balance.totalEntitled} days
                </span>
              </div>
              {requestedDays > 0 && isAnnual && (
                <div className="flex justify-between text-sm mt-1">
                  <span style={{ color: "#4A5568" }}>Requesting:</span>
                  <span className="font-bold" style={{ color: notEnoughDays ? "#C53030" : "#1E3A5F" }}>
                    {requestedDays} day{requestedDays !== 1 ? "s" : ""}
                    {notEnoughDays ? " ⚠️ Exceeds balance" : ""}
                  </span>
                </div>
              )}
              {requestedDays > 0 && isAnnual && !notEnoughDays && (
                <div className="flex justify-between text-sm mt-1">
                  <span style={{ color: "#4A5568" }}>Remaining after:</span>
                  <span className="font-bold" style={{ color: "#276749" }}>
                    {balance.availableDays - requestedDays} days
                  </span>
                </div>
              )}
            </div>
          )}
  
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
              {error}
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
                Leave Type
              </label>
              <select style={inputStyle} value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="annual">Annual Leave (uses balance)</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
              {isAnnual && balance?.availableDays === 0 && (
                <p className="text-xs mt-1" style={{ color: "#C53030" }}>
                  ⚠️ No annual leave days available this year.
                </p>
              )}
            </div>
  
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
                Start Date *
              </label>
              <input type="date" style={inputStyle} required
                min={new Date().toISOString().split("T")[0]}
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
  
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
                End Date *
              </label>
              <input type="date" style={inputStyle} required
                min={form.start_date || new Date().toISOString().split("T")[0]}
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              {requestedDays > 0 && (
                <p className="text-xs mt-1" style={{ color: "#718096" }}>
                  📅 {requestedDays} day{requestedDays !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
  
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
                Reason <span style={{ color: "#A0AEC0", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea style={{ ...inputStyle, resize: "none" }} rows={3}
                placeholder="Brief reason for your leave request..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
  
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading || notEnoughDays}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
                style={{
                  backgroundColor: loading || notEnoughDays ? "#A0AEC0" : "#E67E22",
                  cursor: notEnoughDays ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Submitting..." : notEnoughDays ? "Insufficient Balance" : "Submit Request"}
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