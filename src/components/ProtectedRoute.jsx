import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && !role.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "hr") return <Navigate to="/hr/dashboard" replace />;
    if (user.role === "manager") return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }
  return children;
}