import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";

const TABS = [
  { key: "overview", label: "📊 Overview" },
  { key: "employees", label: "👥 Employees" },
  { key: "departments", label: "🏢 Departments" },
  { key: "leaves", label: "📋 Leaves" },
];

function exportCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row).map(v =>
      typeof v === "string" && v.includes(",") ? `"${v}"` : v
    ).join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, empRes, deptRes, leaveRes] = await Promise.all([
        API.get("/reports/overview"),
        API.get("/reports/employees"),
        API.get("/reports/departments"),
        API.get("/reports/leaves"),
      ]);
      setOverview(overviewRes.data);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setLeaves(leaveRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.position?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLeaves = leaves.filter(l =>
    l.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.department?.toLowerCase().includes(search.toLowerCase())
  );

  const maxDeptCount = overview?.departmentDistribution?.length > 0
    ? Math.max(...overview.departmentDistribution.map(d => d.count))
    : 1;

  const DEPT_COLORS = ["#1E3A5F", "#2E86AB", "#27AE60", "#E67E22", "#8E44AD"];

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            Analytics and insights for your organization
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === "employees") exportCSV(employees, "employees_report");
            else if (activeTab === "departments") exportCSV(departments, "departments_report");
            else if (activeTab === "leaves") exportCSV(leaves, "leaves_report");
          }}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition"
            style={{
              backgroundColor: activeTab === tab.key ? "#1E3A5F" : "#ffffff",
              color: activeTab === tab.key ? "#ffffff" : "#718096",
              border: "1px solid #e2e8f0",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading reports...</div>
      ) : (
        <>
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && overview && (
            <div className="flex flex-col gap-6">

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { label: "Total Employees", value: overview.totalEmployees, icon: "👥", color: "#1E3A5F", bg: "#EBF4FF" },
                  { label: "Active Employees", value: overview.activeEmployees, icon: "✅", color: "#276749", bg: "#F0FFF4" },
                  { label: "Departments", value: overview.totalDepartments, icon: "🏢", color: "#2E86AB", bg: "#EBF8FF" },
                  { label: "Total Leaves", value: overview.totalLeaves, icon: "📋", color: "#B7791F", bg: "#FFF8E1" },
                ].map(card => (
                  <div key={card.label} className="rounded-2xl p-6"
                    style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                      style={{ backgroundColor: card.bg }}>
                      {card.icon}
                    </div>
                    <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-sm mt-1" style={{ color: "#718096" }}>{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Salary overview */}
                <div className="rounded-2xl p-6"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <h3 className="font-bold mb-4" style={{ color: "#2D3748" }}>💰 Salary Overview</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl"
                      style={{ backgroundColor: "#F5F7FA" }}>
                      <p className="text-sm font-semibold" style={{ color: "#718096" }}>Total Monthly Salary</p>
                      <p className="text-xl font-bold" style={{ color: "#1E3A5F" }}>
                        ${(overview.totalSalary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl"
                      style={{ backgroundColor: "#F5F7FA" }}>
                      <p className="text-sm font-semibold" style={{ color: "#718096" }}>Total Annual Salary</p>
                      <p className="text-xl font-bold" style={{ color: "#1E3A5F" }}>
                        ${overview.totalSalary.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl"
                      style={{ backgroundColor: "#F5F7FA" }}>
                      <p className="text-sm font-semibold" style={{ color: "#718096" }}>Average Salary</p>
                      <p className="text-xl font-bold" style={{ color: "#2E86AB" }}>
                        ${overview.activeEmployees > 0
                          ? (overview.totalSalary / overview.activeEmployees).toLocaleString(undefined, { maximumFractionDigits: 0 })
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leave breakdown */}
                <div className="rounded-2xl p-6"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <h3 className="font-bold mb-4" style={{ color: "#2D3748" }}>📋 Leave Breakdown</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Approved", value: overview.approvedLeaves, color: "#276749", bg: "#F0FFF4" },
                      { label: "Pending", value: overview.pendingLeaves, color: "#B7791F", bg: "#FFF8E1" },
                      { label: "Rejected", value: overview.totalLeaves - overview.approvedLeaves - overview.pendingLeaves, color: "#C53030", bg: "#FFF5F5" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-24 text-sm font-semibold" style={{ color: "#718096" }}>{item.label}</div>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#F5F7FA" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: overview.totalLeaves > 0
                                ? `${(item.value / overview.totalLeaves) * 100}%`
                                : "0%",
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: item.bg, color: item.color }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="rounded-2xl p-6"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <h3 className="font-bold mb-6" style={{ color: "#2D3748" }}>🏢 Employees by Department</h3>
                <div className="flex flex-col gap-4">
                  {overview.departmentDistribution.map((dept, i) => (
                    <div key={dept.name} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-semibold truncate" style={{ color: "#4A5568" }}>
                        {dept.name}
                      </div>
                      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "#F5F7FA" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: maxDeptCount > 0 ? `${(dept.count / maxDeptCount) * 100}%` : "0%",
                            backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length],
                          }}
                        />
                      </div>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                      >
                        {dept.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EMPLOYEES TAB ── */}
          {activeTab === "employees" && (
            <div>
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, department or position..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#2D3748" }}
                  onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
                />
                <p className="flex items-center text-sm px-3" style={{ color: "#718096" }}>
                  {filteredEmployees.length} records
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#F5F7FA", borderBottom: "1px solid #e2e8f0" }}>
                      {["Name", "Department", "Position", "Role", "Salary", "Hire Date", "Status"].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "#718096" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-10 text-center" style={{ color: "#718096" }}>
                          No records found
                        </td>
                      </tr>
                    ) : filteredEmployees.map((emp, i) => (
                      <tr key={emp.id}
                        style={{ borderBottom: i < filteredEmployees.length - 1 ? "1px solid #e2e8f0" : "none" }}
                        className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                              style={{ backgroundColor: "#1E3A5F" }}>
                              {emp.name?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{emp.name}</p>
                              <p className="text-xs" style={{ color: "#718096" }}>{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>{emp.department || "—"}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>{emp.position || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                            style={{ backgroundColor: "#EBF4FF", color: "#1E3A5F" }}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold" style={{ color: "#2D3748" }}>
                          ${emp.salary?.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                          {emp.hire_date
                            ? new Date(emp.hire_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: emp.status === "active" ? "#F0FFF4" : "#FFF5F5",
                              color: emp.status === "active" ? "#276749" : "#C53030",
                            }}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS TAB ── */}
          {activeTab === "departments" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {departments.map((dept, i) => (
                <div key={dept.id} className="rounded-2xl p-6"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                      {dept.name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: "#2D3748" }}>{dept.name}</h3>
                      <p className="text-sm" style={{ color: "#718096" }}>
                        Manager: {dept.manager_name || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Employees", value: dept.total_employees, color: "#1E3A5F" },
                      { label: "Active", value: dept.active_employees, color: "#276749" },
                      { label: "Avg Salary", value: `$${(dept.avg_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#2E86AB" },
                      { label: "Total Salary", value: `$${(dept.total_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#E67E22" },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl" style={{ backgroundColor: "#F5F7FA" }}>
                        <p className="text-xs" style={{ color: "#A0AEC0" }}>{item.label}</p>
                        <p className="font-bold mt-0.5" style={{ color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── LEAVES TAB ── */}
          {activeTab === "leaves" && (
            <div>
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or department..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#2D3748" }}
                  onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
                />
                <p className="flex items-center text-sm px-3" style={{ color: "#718096" }}>
                  {filteredLeaves.length} records
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#F5F7FA", borderBottom: "1px solid #e2e8f0" }}>
                      {["Employee", "Department", "Position", "Total", "Approved", "Pending", "Rejected", "Annual", "Sick", "Emergency"].map(h => (
                        <th key={h} className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "#718096" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-5 py-10 text-center" style={{ color: "#718096" }}>
                          No records found
                        </td>
                      </tr>
                    ) : filteredLeaves.map((leave, i) => (
                      <tr key={i}
                        style={{ borderBottom: i < filteredLeaves.length - 1 ? "1px solid #e2e8f0" : "none" }}
                        className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                              style={{ backgroundColor: "#1E3A5F" }}>
                              {leave.employee_name?.[0]}
                            </div>
                            <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>{leave.employee_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm" style={{ color: "#4A5568" }}>{leave.department || "—"}</td>
                        <td className="px-4 py-4 text-sm" style={{ color: "#4A5568" }}>{leave.position || "—"}</td>
                        <td className="px-4 py-4 text-sm font-bold" style={{ color: "#1E3A5F" }}>{leave.total_leaves}</td>
                        <td className="px-4 py-4 text-sm font-semibold" style={{ color: "#276749" }}>{leave.approved}</td>
                        <td className="px-4 py-4 text-sm font-semibold" style={{ color: "#B7791F" }}>{leave.pending}</td>
                        <td className="px-4 py-4 text-sm font-semibold" style={{ color: "#C53030" }}>{leave.rejected}</td>
                        <td className="px-4 py-4 text-sm" style={{ color: "#4A5568" }}>{leave.annual}</td>
                        <td className="px-4 py-4 text-sm" style={{ color: "#4A5568" }}>{leave.sick}</td>
                        <td className="px-4 py-4 text-sm" style={{ color: "#4A5568" }}>{leave.emergency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}