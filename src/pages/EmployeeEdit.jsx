import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Layout from "../components/Layout";

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", role: "employee",
    position: "", department_id: "",
    salary: "", hire_date: "", status: "active",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        API.get(`/employees/${id}`),
        API.get("/admin/departments"),
      ]);
      const e = empRes.data;
      setForm({
        name: e.name || "",
        phone: e.phone || "",
        role: e.role || "employee",
        position: e.position || "",
        department_id: e.department_id || "",
        salary: e.salary || "",
        hire_date: e.hire_date ? e.hire_date.split("T")[0] : "",
        status: e.status || "active",
      });
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await API.put(`/employees/${id}`, form);
      setSuccess("✅ Employee updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748",
    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", outline: "none",
  };

  if (loading) return <Layout><div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
          style={{ backgroundColor: "#F5F7FA", color: "#4A5568", border: "1px solid #e2e8f0" }}>
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>Edit Employee</h1>
          <p className="text-sm" style={{ color: "#718096" }}>Update employee information</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl p-8"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl mb-5"
              style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm px-4 py-3 rounded-xl mb-5"
              style={{ backgroundColor: "#F0FFF4", color: "#276749", border: "1px solid #9AE6B4" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Full Name *</label>
              <input style={inputStyle} required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Phone</label>
              <input style={inputStyle} value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+251 9XX XXX XXX"
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Role</label>
              <select style={inputStyle} value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Position *</label>
              <input style={inputStyle} required value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Department</label>
              <select style={inputStyle} value={form.department_id}
                onChange={e => setForm({ ...form, department_id: e.target.value })}>
                <option value="">Select department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Salary ($)</label>
              <input type="number" style={inputStyle} value={form.salary}
                onChange={e => setForm({ ...form, salary: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Hire Date</label>
              <input type="date" style={inputStyle} value={form.hire_date}
                onChange={e => setForm({ ...form, hire_date: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Status</label>
              <select style={inputStyle} value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
                style={{ backgroundColor: saving ? "#A0AEC0" : "#1E3A5F" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#F5F7FA", color: "#718096", border: "1px solid #e2e8f0" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}