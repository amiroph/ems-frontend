import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        API.get("/admin/departments"),
        API.get("/employees"),
      ]);
      setDepartments(deptRes.data);
      setManagers(empRes.data.filter(e => e.role === "manager" || e.role === "hr" || e.role === "admin"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/departments/${id}`);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const DEPT_COLORS = ["#1E3A5F", "#2E86AB", "#27AE60", "#E67E22", "#8E44AD", "#E74C3C"];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>Departments</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {departments.length} departments
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true); }}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          ➕ Add Department
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, i) => (
            <div
              key={dept.id}
              className="rounded-2xl p-6 transition hover:shadow-md"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                  style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                >
                  {dept.name[0]}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditData(dept); setShowModal(true); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                    style={{ backgroundColor: "#EBF4FF", color: "#1E3A5F" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(dept.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                    style={{ backgroundColor: "#FFF5F5", color: "#C53030" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#2D3748" }}>{dept.name}</h3>
              <p className="text-sm mb-4" style={{ color: "#718096" }}>
                {dept.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #e2e8f0" }}>
                <div>
                  <p className="text-xs" style={{ color: "#A0AEC0" }}>Manager</p>
                  <p className="text-sm font-semibold" style={{ color: "#2D3748" }}>
                    {dept.manager_name || "Not assigned"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#A0AEC0" }}>Employees</p>
                  <p className="text-sm font-bold" style={{ color: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                    {dept.total_employees}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <DeptModal
          editData={editData}
          managers={managers}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="rounded-2xl p-8 max-w-sm w-full mx-4" style={{ backgroundColor: "#ffffff" }}>
            <p className="text-4xl mb-4 text-center">⚠️</p>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "#2D3748" }}>
              Delete Department?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: "#718096" }}>
              This action cannot be undone. Employees in this department will be unassigned.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                style={{ backgroundColor: "#C53030" }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#F5F7FA", color: "#718096", border: "1px solid #e2e8f0" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function DeptModal({ editData, managers, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: editData?.name || "",
    description: editData?.description || "",
    manager_id: editData?.manager_id || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editData) {
        await API.put(`/admin/departments/${editData.id}`, form);
      } else {
        await API.post("/admin/departments", form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department");
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
      <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: "#ffffff" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>
            {editData ? "Edit Department" : "Add Department"}
          </h2>
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
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Department Name *
            </label>
            <input style={inputStyle} placeholder="e.g. Engineering" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Description
            </label>
            <textarea style={{ ...inputStyle, resize: "none" }} rows={3}
              placeholder="Brief description of this department..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Manager
            </label>
            <select style={inputStyle} value={form.manager_id}
              onChange={e => setForm({ ...form, manager_id: e.target.value })}>
              <option value="">Select manager...</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#1E3A5F" }}
            >
              {loading ? "Saving..." : editData ? "Update" : "Create"}
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