import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import WorkspaceGuard from "../components/auth/WorkspaceGuard";
import Layout from "../components/layout/Layout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OnboardingPage from "../pages/OnboardingPage";
import DashboardPage from "../pages/DashboardPage";
import InboxPage from "../pages/InboxPage";
import BookingsPage from "../pages/BookingsPage";
import InventoryPage from "../pages/InventoryPage";
import AlertsPage from "../pages/AlertsPage";
import ContactFormPage from "../pages/ContactFormPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact/:workspaceId" element={<ContactFormPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WorkspaceGuard>
                  <Layout />
                </WorkspaceGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="alerts" element={<AlertsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
