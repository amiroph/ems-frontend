import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("/portal/profile");
      setProfile(res.data);
      setForm({ name: res.data.name, phone: res.data.phone || "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await API.put("/portal/profile", form);
      setMsg("✅ Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setMsg("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F5F7FA",
    color: "#2D3748", width: "100%", padding: "10px 14px",
    borderRadius: "10px", fontSize: "14px", outline: "none",
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>View and update your personal information</p>
      </div>

      <div className="max-w-3xl flex flex-col gap-6">

        {/* Profile Header Card */}
        <div
          className="rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {profile?.name?.[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
            <p className="opacity-70 text-white">{profile?.position}</p>
            <p className="opacity-50 text-white text-sm mt-1">{profile?.department}</p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-xs font-bold capitalize"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
          >
            {profile?.role}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Salary", value: profile?.salary ? `$${parseFloat(profile.salary).toLocaleString()}` : "—", icon: "💰" },
            { label: "Hire Date", value: profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—", icon: "📅" },
            { label: "Status", value: profile?.status || "—", icon: "⚡" },
            { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—", icon: "🗓️" },
          ].map(item => (
            <div key={item.label} className="rounded-2xl p-5 text-center"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="font-bold text-sm" style={{ color: "#2D3748" }}>{item.value}</p>
              <p className="text-xs mt-1" style={{ color: "#718096" }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Editable Details */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold" style={{ color: "#2D3748" }}>Personal Details</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: "#EBF4FF", color: "#1E3A5F" }}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {msg && (
            <div className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{
                backgroundColor: msg.includes("✅") ? "#F0FFF4" : "#FFF5F5",
                color: msg.includes("✅") ? "#276749" : "#C53030",
                border: `1px solid ${msg.includes("✅") ? "#9AE6B4" : "#FED7D7"}`,
              }}>
              {msg}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Full Name</label>
                <input style={inputStyle} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: "#2D3748" }}>Phone Number</label>
                <input style={inputStyle} value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+251 9XX XXX XXX"
                  onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
                  style={{ backgroundColor: saving ? "#A0AEC0" : "#1E3A5F" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#F5F7FA", color: "#718096", border: "1px solid #e2e8f0" }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                { label: "Full Name", value: profile?.name },
                { label: "Email Address", value: profile?.email },
                { label: "Phone Number", value: profile?.phone || "Not provided" },
                { label: "Department", value: profile?.department || "Not assigned" },
                { label: "Position", value: profile?.position || "Not assigned" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ backgroundColor: "#F5F7FA" }}>
                  <p className="text-sm font-semibold w-32 flex-shrink-0" style={{ color: "#718096" }}>{item.label}</p>
                  <p className="text-sm font-semibold" style={{ color: "#2D3748" }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}