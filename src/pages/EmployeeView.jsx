import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Layout from "../components/Layout";
import LeaveBalance from "../components/LeaveBalance";

export default function EmployeeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, leavesRes] = await Promise.all([
        API.get(`/employees/${id}`),
        API.get("/leaves"),
      ]);
      setEmployee(empRes.data);
      setLeaves(leavesRes.data.filter(l => l.employee_email === empRes.data.email));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div></Layout>;
  if (!employee) return <Layout><div className="text-center py-20" style={{ color: "#718096" }}>Employee not found</div></Layout>;

  const STATUS_STYLES = {
    pending:  { bg: "#FFF8E1", color: "#B7791F" },
    approved: { bg: "#F0FFF4", color: "#276749" },
    rejected: { bg: "#FFF5F5", color: "#C53030" },
  };

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
          style={{ backgroundColor: "#F5F7FA", color: "#4A5568", border: "1px solid #e2e8f0" }}
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>{employee.name}</h1>
          <p className="text-sm" style={{ color: "#718096" }}>{employee.position} · {employee.department}</p>
        </div>
        <button
          onClick={() => navigate(`/hr/employees/${id}/edit`)}
          className="ml-auto px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          ✏️ Edit Employee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "#1E3A5F" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              {employee.name?.[0]}
            </div>
            <h3 className="font-bold text-white text-lg">{employee.name}</h3>
            <p className="opacity-70 text-white text-sm">{employee.position}</p>
            <span className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold capitalize"
              style={{
                backgroundColor: employee.status === "active" ? "#F0FFF4" : "#FFF5F5",
                color: employee.status === "active" ? "#276749" : "#C53030",
              }}>
              {employee.status}
            </span>
          </div>

          <div className="rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <h3 className="font-bold mb-4" style={{ color: "#2D3748" }}>Details</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Email", value: employee.email },
                { label: "Phone", value: employee.phone || "—" },
                { label: "Department", value: employee.department || "—" },
                { label: "Role", value: employee.role },
                { label: "Salary", value: `$${employee.salary?.toLocaleString()}` },
                { label: "Hire Date", value: employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs" style={{ color: "#A0AEC0" }}>{item.label}</p>
                  <p className="text-sm font-semibold mt-0.5 capitalize" style={{ color: "#2D3748" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Balance */}
<LeaveBalance employeeId={id} />
        </div>

        {/* Leave History */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
              <h3 className="font-bold" style={{ color: "#2D3748" }}>Leave History ({leaves.length})</h3>
            </div>
            {leaves.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm" style={{ color: "#718096" }}>No leave requests found</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
                {leaves.map(leave => {
                  const s = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
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
                        {leave.reason && <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>{leave.reason}</p>}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        {leave.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}