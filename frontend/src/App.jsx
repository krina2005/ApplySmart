import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import Upload from "./pages/Upload";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyDashboard from "./pages/CompanyDashboard";
import PostJob from "./pages/PostJob";
import CompanyApplications from "./pages/CompanyApplications";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/company" element={<CompanyLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/upload" element={<Upload />} />

        {/* USER PROTECTED ROUTES */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* COMPANY PROTECTED ROUTES */}
        <Route
          path="/company-dashboard"
          element={
            <ProtectedRoute role="company">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute role="company">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute role="company">
              <CompanyApplications />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PROTECTED ROUTES */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

