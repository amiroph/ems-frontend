import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";

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

const TYPE_ICONS = {
  annual: "🏖️", sick: "🤒", emergency: "🚨", unpaid: "💼",
};

function daysBetween(start, end) {
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

export default function ManagerLeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [department, setDepartment] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await API.get("/manager/leave-requests", { params });
      setLeaves(res.data);
      if (res.data.length > 0) setDepartment(res.data[0].department);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await API.put(`/leaves/${id}/status`, { status });
      setLeaves(prev =>
        prev.map(l => l.id === id ? { ...l, status } : l)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = leaves.filter(l =>
    l.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.position?.toLowerCase().includes(search.toLowerCase()) ||
    l.type?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  return (
    <Layout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>
          Leave Requests
        </h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>
          {department
            ? `Showing all leave requests from ${department} department`
            : "All leave requests from your department"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: counts.all, color: "#1E3A5F", bg: "#EBF4FF" },
          { label: "Pending", value: counts.pending, color: "#B7791F", bg: "#FFF8E1" },
          { label: "Approved", value: counts.approved, color: "#276749", bg: "#F0FFF4" },
          { label: "Rejected", value: counts.rejected, color: "#C53030", bg: "#FFF5F5" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-center"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by employee name or position..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none min-w-48"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
          onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
        />
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "", label: `All (${counts.all})` },
            { key: "pending", label: `Pending (${counts.pending})` },
            { key: "approved", label: `Approved (${counts.approved})` },
            { key: "rejected", label: `Rejected (${counts.rejected})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{
                backgroundColor: filterStatus === tab.key ? "#1E3A5F" : "#F5F7FA",
                color: filterStatus === tab.key ? "#ffffff" : "#718096",
                border: "1px solid #e2e8f0",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Cards */}
      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <p className="text-5xl mb-4">📭</p>
          <p className="font-semibold" style={{ color: "#2D3748" }}>
            {filterStatus
              ? `No ${filterStatus} leave requests`
              : "No leave requests in your department"}
          </p>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {filterStatus ? "Try a different filter" : "Your department has no leave requests yet"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(leave => {
            const s = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const t = TYPE_STYLES[leave.type] || TYPE_STYLES.annual;
            const days = daysBetween(leave.start_date, leave.end_date);
            return (
              <div
                key={leave.id}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${leave.status === "pending" ? "#FBD38D" : "#e2e8f0"}`,
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Employee Info */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                      style={{ backgroundColor: "#27AE60" }}
                    >
                      {leave.employee_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "#2D3748" }}>
                        {leave.employee_name}
                      </p>
                      <p className="text-xs" style={{ color: "#718096" }}>
                        {leave.position} · {leave.department}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
                        {leave.employee_email}
                      </p>
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="flex flex-wrap gap-5 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1"
                        style={{ color: "#A0AEC0" }}>Type</p>
                      <div className="flex items-center gap-1.5">
                        <span>{TYPE_ICONS[leave.type] || "📋"}</span>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ backgroundColor: t.bg, color: t.color }}
                        >
                          {leave.type}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1"
                        style={{ color: "#A0AEC0" }}>Duration</p>
                      <p className="font-semibold" style={{ color: "#2D3748" }}>
                        {days} day{days > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1"
                        style={{ color: "#A0AEC0" }}>Dates</p>
                      <p className="font-semibold" style={{ color: "#2D3748" }}>
                        {new Date(leave.start_date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                        })}
                        {" — "}
                        {new Date(leave.end_date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    {leave.reason && (
                      <div>
                        <p className="text-xs uppercase tracking-wide font-semibold mb-1"
                          style={{ color: "#A0AEC0" }}>Reason</p>
                        <p className="text-sm max-w-xs" style={{ color: "#4A5568" }}>
                          {leave.reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                      {leave.reviewed_by_name && (
                        <p className="text-xs mt-1" style={{ color: "#A0AEC0" }}>
                          by {leave.reviewed_by_name}
                        </p>
                      )}
                    </div>
                    {leave.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleStatus(leave.id, "approved")}
                          disabled={updating === leave.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                          style={{ backgroundColor: "#276749" }}
                        >
                          {updating === leave.id ? "..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleStatus(leave.id, "rejected")}
                          disabled={updating === leave.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-80"
                          style={{
                            backgroundColor: "#FFF5F5",
                            color: "#C53030",
                            border: "1px solid #FED7D7",
                          }}
                        >
                          {updating === leave.id ? "..." : "✕ Reject"}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}