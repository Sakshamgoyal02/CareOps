import { useState, useEffect } from "react";
import { getBookings, updateBookingStatus } from "../api/bookings";

const STATUS_COLORS = {
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  "no-show": "bg-red-100 text-red-800",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");

  const fetchBookings = () => {
    getBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-3 py-1 rounded text-sm ${view === "list" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100"}`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`px-3 py-1 rounded text-sm ${view === "calendar" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100"}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {b.contactId?.name || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {b.contactId?.email || b.contactId?.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {b.serviceTypeId?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(b.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            STATUS_COLORS[b.status] || "bg-gray-100"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.status === "confirmed" && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b._id, "completed")}
                              className="text-xs text-green-600 hover:text-green-700"
                            >
                              Completed
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b._id, "no-show")}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              No-show
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">
            Calendar view: bookings listed by date. Use list view for full details.
          </p>
          <div className="mt-4 space-y-2">
            {bookings
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{b.contactId?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(b.date).toLocaleString()} · {b.serviceTypeId?.name}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            {bookings.length === 0 && (
              <p className="text-gray-500">No bookings</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
