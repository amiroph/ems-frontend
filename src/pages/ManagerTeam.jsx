import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";

export default function ManagerTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await API.get("/manager/team");
      setTeam(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = team.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.position?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_STYLES = {
    active:     { bg: "#F0FFF4", color: "#276749" },
    inactive:   { bg: "#FFF8E1", color: "#B7791F" },
    terminated: { bg: "#FFF5F5", color: "#C53030" },
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D3748" }}>My Team</h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>
          {team.length} team members in your department
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search team members..."
          className="w-full max-w-md px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#2D3748" }}
          onFocus={e => e.target.style.border = "1.5px solid #1E3A5F"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
        />
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-16 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <p className="text-5xl mb-4">👥</p>
          <p className="font-semibold" style={{ color: "#2D3748" }}>No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(member => {
            const s = STATUS_STYLES[member.status] || STATUS_STYLES.active;
            return (
              <div key={member.id} className="rounded-2xl p-6 transition hover:shadow-md"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                    style={{ backgroundColor: "#27AE60" }}
                  >
                    {member.name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#2D3748" }}>{member.name}</p>
                    <p className="text-sm" style={{ color: "#718096" }}>{member.position}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: "#A0AEC0" }}>Email</p>
                    <p className="text-xs font-semibold" style={{ color: "#4A5568" }}>{member.email}</p>
                  </div>
                  {member.phone && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: "#A0AEC0" }}>Phone</p>
                      <p className="text-xs font-semibold" style={{ color: "#4A5568" }}>{member.phone}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: "#A0AEC0" }}>Hire Date</p>
                    <p className="text-xs font-semibold" style={{ color: "#4A5568" }}>
                      {member.hire_date
                        ? new Date(member.hire_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: "#A0AEC0" }}>Status</p>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: s.bg, color: s.color }}>
                      {member.status}
                    </span>
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