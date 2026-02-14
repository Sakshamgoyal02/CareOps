import { useState, useEffect } from "react";
import { getInventory, createInventoryItem } from "../api/inventory";
import { getServices } from "../api/services";

function getStatus(item) {
  if (item.quantity <= 0) return { label: "Out", color: "bg-red-100 text-red-800" };
  if (item.quantity <= item.threshold) return { label: "Low", color: "bg-amber-100 text-amber-800" };
  return { label: "OK", color: "bg-green-100 text-green-800" };
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickAdd, setQuickAdd] = useState({ serviceTypeId: "", name: "", quantity: 10, threshold: 5, quantityPerBooking: 1 });

  const INVENTORY_TEMPLATES = [
    { id: "itm_mask", name: "Surgical Mask" },
    { id: "itm_iv", name: "IV Kit" },
    { id: "itm_ox", name: "Pulse Oximeter" },
  ];

  useEffect(() => {
    getInventory()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
    // fetch services for mapping/select
    getServices().then(setServices).catch(() => setServices([]));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="font-medium mb-2">Quick Add Item</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <select
            value={quickAdd.name ? "selected" : ""}
            onChange={(e) => {
              const tpl = INVENTORY_TEMPLATES.find((t) => t.id === e.target.value);
              if (tpl) setQuickAdd((p) => ({ ...p, name: tpl.name }));
              else setQuickAdd((p) => ({ ...p, name: "" }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select template</option>
            {INVENTORY_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={quickAdd.serviceTypeId}
            onChange={(e) => setQuickAdd((p) => ({ ...p, serviceTypeId: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Assign to service (optional)</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <input
            value={quickAdd.name}
            onChange={(e) => setQuickAdd((p) => ({ ...p, name: e.target.value }))}
            placeholder="Item name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />

          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (!quickAdd.name) return;
                try {
                  const newItem = await createInventoryItem(quickAdd);
                  setItems((p) => [newItem, ...p]);
                  setQuickAdd({ serviceTypeId: "", name: "", quantity: 10, threshold: 5, quantityPerBooking: 1 });
                } catch (err) {
                  console.error("Quick add failed", err);
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per Booking</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No inventory items
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.serviceTypeId?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">{item.threshold}</td>
                      <td className="px-4 py-3 text-sm">{item.quantityPerBooking ?? 1}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            status.color
                          }`}
                        >
                          {status.label}
                        </span>
                        {status.label !== "OK" && (
                          <span className="ml-1 text-amber-600">⚠</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
