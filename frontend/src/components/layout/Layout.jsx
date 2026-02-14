import { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", roles: ["owner", "staff"] },
  { path: "/inbox", label: "Inbox", perm: "inbox" },
  { path: "/bookings", label: "Bookings", perm: "bookings" },
  { path: "/inventory", label: "Inventory", perm: "inventory" },
  { path: "/alerts", label: "Alerts", roles: ["owner", "staff"] },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const canAccess = (item) => {
    if (user?.role === "owner") return true;
    if (item.roles && item.roles.includes(user?.role)) return true;
    if (item.perm && user?.permissions?.[item.perm]) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/dashboard" className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900">
                CareOps
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 capitalize">{user?.role}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 pt-16 lg:pt-4`}
        >
          <div className="h-full overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {navItems.filter(canAccess).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "owner" && (
                <Link
                  to="/onboarding"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === "/onboarding"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  Settings
                </Link>
              )}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8"><Outlet /></main>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
}
