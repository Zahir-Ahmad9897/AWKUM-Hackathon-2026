// ─── App Router ───

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CampaignList from "./pages/campaigns/CampaignList";
import CampaignDetail from "./pages/campaigns/CampaignDetail";
import CreateCampaign from "./pages/campaigns/CreateCampaign";
import Dashboard from "./pages/dashboard/Dashboard";
import NGODashboard from "./pages/ngo/NGODashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              background: "#FFFEF9",
              color: "#2C2416",
              border: "1px solid #e0d7c7ff",
              boxShadow: "0 4px 20px rgba(44,36,22,0.08)",
            },
          }}
        />
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/campaigns" element={<CampaignList />} />

            {/* BUG FIX #1: /campaigns/create MUST be before /campaigns/:id
                so React Router doesn't treat "create" as an id param */}
            <Route path="/campaigns/create" element={
              <ProtectedRoute><CreateCampaign /></ProtectedRoute>
            } />

            {/* Dynamic campaign detail — after static routes */}
            <Route path="/campaigns/:id" element={<CampaignDetail />} />

            {/* Protected: Any authenticated user */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            {/* Protected: NGO only */}
            <Route path="/ngo" element={
              <ProtectedRoute roles={["NGO"]}><NGODashboard /></ProtectedRoute>
            } />

            {/* Protected: Admin only */}
            <Route path="/admin" element={
              <ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-warm-400">
                <p className="text-6xl font-bold text-warm-200 mb-4">404</p>
                <p className="text-lg">Page not found</p>
              </div>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
