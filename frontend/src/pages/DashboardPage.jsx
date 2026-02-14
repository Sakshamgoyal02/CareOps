import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/dashboard";
import { getAlerts } from "../api/alerts";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getAlerts()])
      .then(([d, a]) => {
        setData(d);
        setAlerts(a.filter((x) => !x.resolved));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">What is happening in your business right now?</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Today&apos;s Bookings</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.bookings?.today ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.bookings?.upcoming ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.bookings?.completed ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">No-shows</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.bookings?.noShow ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending Forms</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.forms?.pending ?? 0}</p>
          <Link
            to="/bookings"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            View bookings →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Low Inventory Alerts</h3>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data?.alerts?.lowInventory ?? 0}</p>
          <Link
            to="/inventory"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            View inventory →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Missed Messages</h3>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data?.alerts?.missedMessages ?? 0}</p>
          <Link
            to="/inbox"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            View inbox →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Key Alerts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No active alerts</p>
          ) : (
            alerts.slice(0, 10).map((a) => (
              <Link
                key={a._id}
                to={
                  a.type === "message"
                    ? "/inbox"
                    : a.type === "form" || a.type === "booking"
                    ? "/bookings"
                    : a.type === "inventory"
                    ? "/inventory"
                    : "/alerts"
                }
                className="block p-4 hover:bg-gray-50 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 capitalize">
                      {a.type}
                    </span>
                    <p className="mt-1 text-sm text-gray-700">{a.message}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-indigo-600 text-sm">View →</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
