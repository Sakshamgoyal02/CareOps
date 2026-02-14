import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAlerts, resolveAlert } from "../api/alerts";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unresolved

  const fetchAlerts = () => {
    getAlerts()
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const list = filter === "unresolved" ? alerts.filter((a) => !a.resolved) : alerts;

  const getLink = (a) => {
    if (a.type === "message") return "/inbox";
    if (a.type === "form" || a.type === "booking") return "/bookings";
    if (a.type === "inventory") return "/inventory";
    return "/dashboard";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All</option>
          <option value="unresolved">Unresolved only</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {list.length === 0 ? (
          <p className="p-6 text-gray-500">No alerts</p>
        ) : (
          list.map((a) => (
            <div
              key={a._id}
              className={`p-4 hover:bg-gray-50 ${a.resolved ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <Link to={getLink(a)} className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 capitalize">
                    {a.type}
                  </span>
                  <p className="mt-1 text-sm text-gray-700">{a.message}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(a.createdAt).toLocaleString()}
                    {a.resolved && " · Resolved"}
                  </p>
                </Link>
                {!a.resolved && (
                  <button
                    type="button"
                    onClick={() => handleResolve(a._id)}
                    className="shrink-0 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
