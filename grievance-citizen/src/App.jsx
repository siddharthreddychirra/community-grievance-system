import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import LoginRole from "./pages/LoginRole";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import MyComplaints from "./pages/MyComplaints"; // ✅ Import MyComplaints page
import AdminAnalytics from "./pages/AdminAnalytics"; // ✅ Import Analytics page

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<LoginRole />} />
        <Route path="/login/form" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="citizen">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Citizen complaints route */}
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute role="citizen">
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin analytics route */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

