import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Layout from "../components/Layout";

const STATUS_STYLES = {
  active:     { bg: "#F0FFF4", color: "#276749" },
  inactive:   { bg: "#FFF8E1", color: "#B7791F" },
  terminated: { bg: "#FFF5F5", color: "#C53030" },
};

const ROLE_STYLES = {
  hr:       { bg: "#EBF8FF", color: "#2C5282" },
  manager:  { bg: "#FAF5FF", color: "#553C9A" },
  employee: { bg: "#F0FFF4", color: "#276749" },
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterDept, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterStatus) params.status = filterStatus;
      const [empRes, deptRes] = await Promise.all([
        API.get("/employees", { params }),
        API.get("/admin/departments"),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.position?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>Employees</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {employees.length} total employees
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-5 mb-6 flex flex-wrap gap-4"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, position or email..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none min-w-48"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
          onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
        />
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
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#F5F7FA", borderBottom: "1px solid #e2e8f0" }}>
              {["Employee", "Department", "Position", "Role", "Status", "Hire Date", "Actions"].map(h => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#718096" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center" style={{ color: "#718096" }}>
                  Loading employees...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="font-semibold" style={{ color: "#2D3748" }}>No employees found</p>
                </td>
              </tr>
            ) : filtered.map((emp, i) => {
              const s = STATUS_STYLES[emp.status] || STATUS_STYLES.active;
              const r = ROLE_STYLES[emp.role] || ROLE_STYLES.employee;
              return (
                <tr
                  key={emp.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #e2e8f0" : "none" }}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                        style={{ backgroundColor: "#1E3A5F" }}
                      >
                        {emp.name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{emp.name}</p>
                        <p className="text-xs" style={{ color: "#718096" }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                    {emp.department || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                    {emp.position || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: r.bg, color: r.color }}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                    {emp.hire_date
                      ? new Date(emp.hire_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                  <div className="flex gap-2">
  <button
    onClick={() => {
      const base = window.location.pathname.startsWith("/hr") ? "/hr" : "/admin";
      navigate(`${base}/employees/${emp.id}`);
    }}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
    style={{ backgroundColor: "#EBF4FF", color: "#1E3A5F" }}
  >
    View
  </button>
  <button
    onClick={() => {
      const base = window.location.pathname.startsWith("/hr") ? "/hr" : "/admin";
      navigate(`${base}/employees/${emp.id}/edit`);
    }}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
    style={{ backgroundColor: "#F5F7FA", color: "#4A5568", border: "1px solid #e2e8f0" }}
  >
    Edit
  </button>
</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          departments={departments}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchData(); }}
        />
      )}
    </Layout>
  );
}

function AddEmployeeModal({ departments, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    role: "employee", position: "", department_id: "",
    salary: "", hire_date: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/employees", form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create employee");
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
        className="w-full max-w-2xl rounded-2xl p-8 max-h-screen overflow-y-auto"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Add New Employee</h2>
          <button onClick={onClose} className="text-2xl" style={{ color: "#718096" }}>✕</button>
        </div>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Full Name *</label>
            <input style={inputStyle} placeholder="John Doe" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Email *</label>
            <input type="email" style={inputStyle} placeholder="john@company.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Password *</label>
            <input type="password" style={inputStyle} placeholder="Min. 6 characters" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Phone</label>
            <input style={inputStyle} placeholder="+251 9XX XXX XXX"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Position *</label>
            <input style={inputStyle} placeholder="e.g. Software Engineer" required
              value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Role</label>
            <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Department</label>
            <select style={inputStyle} value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
              <option value="">Select department...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Salary ($)</label>
            <input type="number" style={inputStyle} placeholder="e.g. 50000"
              value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Hire Date</label>
            <input type="date" style={inputStyle}
              value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>

          <div className="col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#1E3A5F" }}
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition"
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