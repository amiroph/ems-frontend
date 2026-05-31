import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Employees", path: "/admin/employees", icon: "👥" },
    { label: "Departments", path: "/admin/departments", icon: "🏢" },
    { label: "Leave Requests", path: "/admin/leaves", icon: "📋" },
    { label: "Reports", path: "/admin/reports", icon: "📈" },
    { label: "Users", path: "/admin/users", icon: "⚙️" },
  ],
  hr: [
    { label: "Dashboard", path: "/hr/dashboard", icon: "📊" },
    { label: "Employees", path: "/hr/employees", icon: "👥" },
    { label: "Leave Requests", path: "/hr/leaves", icon: "📋" },
    { label: "Reports", path: "/hr/reports", icon: "📈" },
  ],
  manager: [
    { label: "Dashboard", path: "/manager/dashboard", icon: "📊" },
    { label: "My Team", path: "/manager/team", icon: "👥" },
    { label: "My Leaves", path: "/manager/leaves", icon: "📋" },
    { label: "Leave Requests", path: "/manager/leave-requests", icon: "✅" },
  ],
  employee: [
    { label: "Dashboard", path: "/employee/dashboard", icon: "📊" },
    { label: "My Profile", path: "/employee/profile", icon: "👤" },
    { label: "My Leaves", path: "/employee/leaves", icon: "📋" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = NAV_ITEMS[user?.role] || [];

  const ROLE_COLORS = {
    admin: "#E67E22",
    hr: "#2E86AB",
    manager: "#27AE60",
    employee: "#8E44AD",
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col"
      style={{ backgroundColor: "#1E3A5F", zIndex: 50 }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            🏢
          </div>
          <div>
            <p className="font-bold text-white text-sm">EMS Portal</p>
            <p className="text-xs opacity-50 text-white">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#E67E22" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ backgroundColor: ROLE_COLORS[user?.role] || "#E67E22" }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p
              className="text-xs capitalize px-1.5 py-0.5 rounded-full inline-block mt-0.5"
              style={{ backgroundColor: ROLE_COLORS[user?.role] + "33", color: ROLE_COLORS[user?.role] }}
            >
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs opacity-50 hover:opacity-100 transition text-white"
            title="Logout"
          >
            ⎋
          </button>
        </div>
      </div>
    </aside>
  );
}