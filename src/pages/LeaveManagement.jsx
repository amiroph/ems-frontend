import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";

const STATUS_STYLES = {
  pending:  { bg: "#FFF8E1", color: "#B7791F", label: "Pending" },
  approved: { bg: "#F0FFF4", color: "#276749", label: "Approved" },
  rejected: { bg: "#FFF5F5", color: "#C53030", label: "Rejected" },
};

const LEAVE_TYPES = {
  annual:    { bg: "#EBF8FF", color: "#2C5282" },
  sick:      { bg: "#FFF5F5", color: "#C53030" },
  emergency: { bg: "#FFFAF0", color: "#C05621" },
  unpaid:    { bg: "#F7FAFC", color: "#4A5568" },
};

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterDept]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDept) params.department = filterDept;
      const [leavesRes, deptRes] = await Promise.all([
        API.get("/leaves", { params }),
        API.get("/admin/departments"),
      ]);
      setLeaves(leavesRes.data);
      setDepartments(deptRes.data);
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

  const counts = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>Leave Requests</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            Review and manage employee leave requests
          </p>
        </div>
      </div>

      {/* Summary Cards */}
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
        className="rounded-2xl p-5 mb-6 flex flex-wrap gap-4"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Leave Cards */}
      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
      ) : leaves.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <p className="text-5xl mb-4">📭</p>
          <p className="font-semibold" style={{ color: "#2D3748" }}>No leave requests found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {leaves.map(leave => {
            const s = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const t = LEAVE_TYPES[leave.type] || LEAVE_TYPES.annual;
            const days = daysBetween(leave.start_date, leave.end_date);
            return (
              <div
                key={leave.id}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Employee Info */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: "#1E3A5F" }}
                    >
                      {leave.employee_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "#2D3748" }}>{leave.employee_name}</p>
                      <p className="text-xs" style={{ color: "#718096" }}>
                        {leave.department} · {leave.position}
                      </p>
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: "#A0AEC0" }}>Type</p>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ backgroundColor: t.bg, color: t.color }}
                      >
                        {leave.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: "#A0AEC0" }}>Duration</p>
                      <p className="font-semibold" style={{ color: "#2D3748" }}>{days} day{days > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: "#A0AEC0" }}>Dates</p>
                      <p className="font-semibold" style={{ color: "#2D3748" }}>
                        {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" — "}
                        {new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    {leave.reason && (
                      <div>
                        <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: "#A0AEC0" }}>Reason</p>
                        <p className="text-sm max-w-xs" style={{ color: "#4A5568" }}>{leave.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                    {leave.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatus(leave.id, "approved")}
                          disabled={updating === leave.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                          style={{ backgroundColor: "#276749" }}
                        >
                          {updating === leave.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleStatus(leave.id, "rejected")}
                          disabled={updating === leave.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-80"
                          style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
                        >
                          {updating === leave.id ? "..." : "Reject"}
                        </button>
                      </div>
                    )}
                    {leave.status !== "pending" && leave.reviewed_by_name && (
                      <p className="text-xs" style={{ color: "#A0AEC0" }}>
                        by {leave.reviewed_by_name}
                      </p>
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