import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const ROLE_STYLES = {
  admin:    { bg: "#FFF5F5", color: "#C53030", label: "Admin" },
  hr:       { bg: "#EBF8FF", color: "#2C5282", label: "HR" },
  manager:  { bg: "#FAF5FF", color: "#553C9A", label: "Manager" },
  employee: { bg: "#F0FFF4", color: "#276749", label: "Employee" },
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle`);
      setUsers(prev =>
        prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u)
      );
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/admin/users/${deleteId}`);
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()) ||
      u.position?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = filterStatus === "" ? true :
      filterStatus === "active" ? u.is_active : !u.is_active;
    return matchSearch && matchRole && matchStatus;
  });

  const counts = {
    total: users.length,
    admin: users.filter(u => u.role === "admin").length,
    hr: users.filter(u => u.role === "hr").length,
    manager: users.filter(u => u.role === "manager").length,
    employee: users.filter(u => u.role === "employee").length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  };

  return (
    <Layout>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {users.length} total users in the system
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          ➕ Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: counts.total, color: "#1E3A5F", bg: "#EBF4FF" },
          { label: "Active", value: counts.active, color: "#276749", bg: "#F0FFF4" },
          { label: "Inactive", value: counts.inactive, color: "#C53030", bg: "#FFF5F5" },
          { label: "Managers", value: counts.manager, color: "#553C9A", bg: "#FAF5FF" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Role breakdown */}
      <div className="flex gap-3 flex-wrap mb-6">
        {Object.entries(ROLE_STYLES).map(([role, style]) => (
          <div key={role} className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: style.bg }}>
            <span className="text-xs font-bold capitalize" style={{ color: style.color }}>
              {style.label}
            </span>
            <span className="text-xs font-bold" style={{ color: style.color }}>
              {counts[role] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 mb-6 flex flex-wrap gap-4"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, department..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none min-w-48"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}
          onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA", color: "#2D3748" }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p className="flex items-center text-sm" style={{ color: "#718096" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#F5F7FA", borderBottom: "1px solid #e2e8f0" }}>
              {["User", "Role", "Department", "Position", "Status", "Joined", "Actions"].map(h => (
                <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#718096" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center" style={{ color: "#718096" }}>
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center">
                  <p className="text-4xl mb-3">👤</p>
                  <p className="font-semibold" style={{ color: "#2D3748" }}>No users found</p>
                </td>
              </tr>
            ) : filtered.map((u, i) => {
              const r = ROLE_STYLES[u.role] || ROLE_STYLES.employee;
              const isMe = u.id === currentUser?.id;
              return (
                <tr key={u.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #e2e8f0" : "none" }}
                  className="hover:bg-gray-50 transition">

                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                        style={{ backgroundColor: u.is_active ? "#1E3A5F" : "#A0AEC0" }}
                      >
                        {u.name?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm" style={{ color: "#2D3748" }}>
                            {u.name}
                          </p>
                          {isMe && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: "#EBF4FF", color: "#1E3A5F" }}>
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: "#718096" }}>{u.email}</p>
                        {u.phone && (
                          <p className="text-xs" style={{ color: "#A0AEC0" }}>{u.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: r.bg, color: r.color }}>
                      {r.label}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                    {u.department || "—"}
                  </td>

                  {/* Position */}
                  <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                    {u.position || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => !isMe && handleToggle(u.id)}
                        className="w-10 h-5 rounded-full relative transition-all"
                        style={{
                          backgroundColor: u.is_active ? "#276749" : "#CBD5E0",
                          cursor: isMe ? "not-allowed" : "pointer",
                          opacity: isMe ? 0.6 : 1,
                        }}
                      >
                        <div
                          className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                          style={{ left: u.is_active ? "22px" : "2px" }}
                        />
                      </div>
                      <span className="text-xs font-semibold"
                        style={{ color: u.is_active ? "#276749" : "#C53030" }}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                    {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setEditUser(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                        style={{ backgroundColor: "#EBF4FF", color: "#1E3A5F" }}
                      >
                        Edit
                      </button>
                      {/* Only show Reset PW if user is NOT admin */}
{u.role !== "admin" && (
  <button
    onClick={() => setResetUser(u)}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
    style={{ backgroundColor: "#FFF8E1", color: "#B7791F", border: "1px solid #FAD089" }}
  >
    Reset PW
  </button>
)}
                      {!isMe && (
                        <button
                          onClick={() => setDeleteId(u.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                          style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchUsers(); }}
        />
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { setEditUser(null); fetchUsers(); }}
        />
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full mx-4"
            style={{ backgroundColor: "#ffffff" }}>
            <p className="text-4xl mb-4 text-center">⚠️</p>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "#2D3748" }}>
              Delete User?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: "#718096" }}>
              This will permanently delete the user and all their data including leave requests. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
                style={{ backgroundColor: deleting ? "#A0AEC0" : "#C53030" }}
              >
                {deleting ? "Deleting..." : "Delete"}
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

// ── ADD USER MODAL ──
function AddUserModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "", email: "", password: "", phone: "", role: "admin",
      });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setError("");
    setLoading(true);
    try {
      await API.post("/admin/users", form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
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
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Add New User</h2>
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
              Full Name *
            </label>
            <input style={inputStyle} placeholder="John Doe" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Email Address *
            </label>
            <input type="email" style={inputStyle} placeholder="john@company.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Password *
            </label>
            <input type="password" style={inputStyle} placeholder="Min. 6 characters" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Phone
            </label>
            <input style={inputStyle} placeholder="+251 9XX XXX XXX"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
  <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
    Role
  </label>
  <select style={inputStyle} value={form.role}
    onChange={e => setForm({ ...form, role: e.target.value })}>
    <option value="admin">Admin</option>
  </select>
  <p className="text-xs mt-1" style={{ color: "#718096" }}>
    To add HR, Manager or Employee use the Employee Management page.
  </p>
</div>
<div
  className="text-xs px-4 py-3 rounded-xl"
  style={{ backgroundColor: "#EBF4FF", color: "#2C5282" }}
>
  ℹ️ This form creates Admin accounts only. To add HR, Managers or Employees go to <strong>Employee Management</strong>.
</div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#1E3A5F" }}>
              {loading ? "Creating..." : "Create User"}
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

// ── EDIT USER MODAL ──
function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "employee",
    is_active: user.is_active,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.put(`/admin/users/${user.id}`, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
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
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Edit User</h2>
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
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Full Name *</label>
            <input style={inputStyle} required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Email Address *</label>
            <input type="email" style={inputStyle} required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Phone</label>
            <input style={inputStyle} value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+251 9XX XXX XXX"
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Role</label>
            <select style={inputStyle} value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Status</label>
            <select style={inputStyle} value={form.is_active ? "active" : "inactive"}
              onChange={e => setForm({ ...form, is_active: e.target.value === "active" })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#1E3A5F" }}>
              {loading ? "Saving..." : "Save Changes"}
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

// ── RESET PASSWORD MODAL ──
function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await API.put(`/admin/users/${user.id}/reset-password`, { password });
      setSuccess("✅ Password reset successfully!");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
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
          <h2 className="text-xl font-bold" style={{ color: "#2D3748" }}>Reset Password</h2>
          <button onClick={onClose} style={{ color: "#718096", fontSize: "20px" }}>✕</button>
        </div>

        <p className="text-sm mb-5 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#FFF8E1", color: "#B7791F" }}>
          🔑 Resetting password for <strong>{user.name}</strong>
        </p>

        {error && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "#F0FFF4", color: "#276749", border: "1px solid #9AE6B4" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              New Password *
            </label>
            <input type="password" style={inputStyle} required
              placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>
              Confirm Password *
            </label>
            <input type="password" style={inputStyle} required
              placeholder="Repeat new password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: loading ? "#A0AEC0" : "#B7791F" }}>
              {loading ? "Resetting..." : "Reset Password"}
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