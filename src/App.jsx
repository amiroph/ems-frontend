import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import EmployeeView from "./pages/EmployeeView";
import EmployeeEdit from "./pages/EmployeeEdit";
import ManagerTeam from "./pages/ManagerTeam";
import Departments from "./pages/Departments";
import LeaveManagement from "./pages/LeaveManagement";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import ManagerLeaves from "./pages/ManagerLeaves";
import ManagerLeaveRequests from "./pages/ManagerLeaveRequests";
import Users from "./pages/Users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route path="/manager/leave-requests" element={
  <ProtectedRoute role={["manager"]}>
    <ManagerLeaveRequests />
  </ProtectedRoute>
} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute role={["admin", "hr"]}><EmployeeList /></ProtectedRoute>} />
      <Route path="/admin/employees/:id" element={<ProtectedRoute role={["admin", "hr"]}><EmployeeView /></ProtectedRoute>} />
      <Route path="/admin/employees/:id/edit" element={<ProtectedRoute role={["admin", "hr"]}><EmployeeEdit /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute role={["admin"]}><Departments /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute role={["admin", "hr", "manager"]}><LeaveManagement /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role={["admin", "hr"]}><Reports /></ProtectedRoute>} />

      {/* HR */}
      <Route path="/hr/dashboard" element={<ProtectedRoute role={["hr"]}><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute role={["hr"]}><EmployeeList /></ProtectedRoute>} />
      <Route path="/hr/employees/:id" element={<ProtectedRoute role={["hr"]}><EmployeeView /></ProtectedRoute>} />
      <Route path="/hr/employees/:id/edit" element={<ProtectedRoute role={["hr"]}><EmployeeEdit /></ProtectedRoute>} />
      <Route path="/hr/leaves" element={<ProtectedRoute role={["hr"]}><LeaveManagement /></ProtectedRoute>} />
      <Route path="/hr/reports" element={<ProtectedRoute role={["hr"]}><Reports /></ProtectedRoute>} />

      {/* Manager */}
      <Route path="/manager/dashboard" element={<ProtectedRoute role={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/team" element={<ProtectedRoute role={["manager"]}><ManagerTeam /></ProtectedRoute>} />
      <Route path="/manager/leaves" element={<ProtectedRoute role={["manager"]}><ManagerLeaves /></ProtectedRoute>} />

      {/* Employee */}
      <Route path="/employee/dashboard" element={<ProtectedRoute role={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute role={["employee"]}><EmployeeProfile /></ProtectedRoute>} />
      <Route path="/employee/leaves" element={<ProtectedRoute role={["employee"]}><EmployeeLeaves /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />

      <Route path="/admin/users" element={
  <ProtectedRoute role={["admin"]}><Users /></ProtectedRoute>
} />
    </Routes>
  );
}

export default App;