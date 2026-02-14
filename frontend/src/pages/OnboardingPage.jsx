import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getWorkspace,
  getIntegrationStatus,
  updateWorkspace,
  activateWorkspace,
} from "../api/workspaces";
import { getServices, createService } from "../api/services";
import { getInventory, createInventoryItem } from "../api/inventory";
import { createStaff } from "../api/users";

const STEPS = [
  "Workspace Setup",
  "Communication",
  "Contact Form",
  "Booking Setup",
  "Inventory",
  "Staff",
  "Activation",
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState(null);
  const [services, setServices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    contactEmail: "",
    timezone: "America/New_York",
  });
  const [integrationStatus, setIntegrationStatus] = useState(null);

  const [serviceForm, setServiceForm] = useState({
    name: "",
    duration: 60,
    availability: ["09:00", "10:00", "11:00"],
    location: "",
  });

  const SERVICE_TEMPLATES = [
    { id: "tpl_consult", name: "General Consultation", duration: 30, location: "Clinic" },
    { id: "tpl_covid", name: "COVID-19 Test", duration: 15, location: "Lab" },
    { id: "tpl_vaccine", name: "Vaccination", duration: 10, location: "Immunization Room" },
  ];

  const [inventoryForm, setInventoryForm] = useState({
    serviceTypeId: "",
    name: "",
    quantity: 100,
    threshold: 10,
    quantityPerBooking: 1,
  });

  const INVENTORY_TEMPLATES = [
    { id: "itm_mask", name: "Surgical Mask" },
    { id: "itm_iv", name: "IV Kit" },
    { id: "itm_ox", name: "Pulse Oximeter" },
  ];

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: { inbox: true, bookings: true, forms: true, inventory: true },
  });

  useEffect(() => {
    if (user?.role !== "owner") {
      navigate("/dashboard");
      return;
    }
    getWorkspace().then(setWorkspace).catch(console.error);
    getServices().then(setServices).catch(console.error);
    getInventory().then(setInventory).catch(console.error);
  }, [user, navigate]);

  useEffect(() => {
    if (workspace) {
      setForm({
        name: workspace.name || "",
        address: workspace.address || "",
        contactEmail: workspace.contactEmail || "",
        timezone: workspace.timezone || "America/New_York",
      });
      if (workspace.integrationStatus) {
        setIntegrationStatus(workspace.integrationStatus);
      }
    }
  }, [workspace]);

  const fetchIntegrationStatus = () => {
    getIntegrationStatus()
      .then(setIntegrationStatus)
      .catch(() => setIntegrationStatus({ emailConnected: false }));
  };

  useEffect(() => {
    if (step === 1 || step === 6) fetchIntegrationStatus();
  }, [step]);

  const emailConnected = integrationStatus?.emailConnected ?? false;
  const canActivate = emailConnected && services?.length > 0;

  const handleSaveWorkspace = async () => {
    setError("");
    setLoading(true);
    try {
      const w = await updateWorkspace(form);
      setWorkspace(w);
      setIntegrationStatus(w.integrationStatus || null);
      setStep(1);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const s = await createService(serviceForm);
      setServices((p) => [...p, s]);
      setServiceForm({ name: "", duration: 60, availability: ["09:00", "10:00", "11:00"], location: "" });
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.serviceTypeId) {
      setError("Select a service");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const i = await createInventoryItem(inventoryForm);
      setInventory((p) => [...p, i]);
      setInventoryForm({ serviceTypeId: "", name: "", quantity: 100, threshold: 10, quantityPerBooking: 1 });
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createStaff(staffForm);
      setStaffForm({ name: "", email: "", password: "", permissions: { inbox: true, bookings: true, forms: true, inventory: true } });
      setStep(6);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setError("");
    setLoading(true);
    try {
      await activateWorkspace();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!workspace && user?.role === "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Onboarding</h1>
        <p className="text-gray-600 mb-8">Set up your workspace to get started.</p>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium ${
                step === i ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Workspace Setup</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="America/New_York">Eastern</option>
                  <option value="America/Chicago">Central</option>
                  <option value="America/Los_Angeles">Pacific</option>
                  <option value="Asia/Kolkata">India</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleSaveWorkspace}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Save & Continue
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Communication Setup</h2>
              <p className="text-sm text-gray-600">
                At least one channel must be connected. Once connected, the Inbox will be available in the app sidebar.
              </p>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Email</span>
                  {integrationStatus === null ? (
                    <span className="text-sm text-gray-500">Checking...</span>
                  ) : emailConnected ? (
                    <span className="text-sm font-medium text-green-600">✓ Connected</span>
                  ) : (
                    <span className="text-sm font-medium text-amber-600">Not connected</span>
                  )}
                </div>

                {!emailConnected ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Email integration is not configured. You can enter a contact email here to proceed (this saves the workspace contact email).
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                        placeholder="owner@business.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setError("");
                          setLoading(true);
                          try {
                            const w = await updateWorkspace({ contactEmail: form.contactEmail });
                            setWorkspace(w);
                            // Optimistically mark connected so user can continue
                            setIntegrationStatus((s) => ({ ...(s || {}), emailConnected: true }));
                          } catch (e) {
                            setError(e.response?.data?.message || "Failed to save email");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || !form.contactEmail}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm disabled:opacity-50"
                      >
                        {loading ? "Connecting..." : "Connect"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={fetchIntegrationStatus}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Refresh status
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-green-600">✓ Email is configured and ready</p>
                    <button
                      type="button"
                      onClick={async () => {
                        // simple disconnect action for UI
                        try {
                          await updateWorkspace({ contactEmail: "" });
                          setWorkspace((w) => ({ ...(w || {}), contactEmail: "" }));
                          setIntegrationStatus((s) => ({ ...(s || {}), emailConnected: false }));
                        } catch (e) {
                          setError(e.response?.data?.message || "Failed to disconnect");
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Disconnect Email
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!emailConnected}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Form</h2>
              <p className="text-sm text-gray-600">
                Your public contact form is ready. Share this link with customers — when they submit, a Contact is created, a Conversation is started, and a welcome message is sent automatically.
              </p>
              {workspace?._id && (
                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Share this link:</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}/contact/${workspace._id}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/contact/${workspace._id}`);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              <a
                href={workspace ? `/contact/${workspace._id}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-indigo-600 hover:text-indigo-500"
              >
                Preview contact form →
              </a>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Booking Setup</h2>
              <p className="text-sm text-gray-600">Add at least one service type.</p>
              <form onSubmit={handleAddService} className="space-y-3">
                <select
                  onChange={(e) => {
                    const tpl = SERVICE_TEMPLATES.find((t) => t.id === e.target.value);
                    if (tpl) setServiceForm((p) => ({ ...p, name: tpl.name, duration: tpl.duration, location: tpl.location }));
                    else setServiceForm((p) => ({ ...p, name: "", duration: 60, location: "" }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a template (optional)</option>
                  {SERVICE_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Service name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm((p) => ({ ...p, duration: +e.target.value }))}
                  placeholder="Duration (minutes)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  value={serviceForm.location}
                  onChange={(e) => setServiceForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Service
                </button>
              </form>
              {services.length > 0 && (
                <ul className="text-sm text-gray-600">
                  {services.map((s) => (
                    <li key={s._id}>• {s.name}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Inventory Setup</h2>
              <p className="text-sm text-gray-600">Add items used per booking (optional).</p>
              <form onSubmit={handleAddInventory} className="space-y-3">
                <select
                  onChange={(e) => {
                    const tpl = INVENTORY_TEMPLATES.find((t) => t.id === e.target.value);
                    if (tpl) setInventoryForm((p) => ({ ...p, name: tpl.name }));
                    else setInventoryForm((p) => ({ ...p, name: "" }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an item template (optional)</option>
                  {INVENTORY_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select
                  value={inventoryForm.serviceTypeId}
                  onChange={(e) => setInventoryForm((p) => ({ ...p, serviceTypeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <input
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Item name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  value={inventoryForm.quantity}
                  onChange={(e) => setInventoryForm((p) => ({ ...p, quantity: +e.target.value }))}
                  placeholder="Quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  value={inventoryForm.threshold}
                  onChange={(e) => setInventoryForm((p) => ({ ...p, threshold: +e.target.value }))}
                  placeholder="Low stock threshold"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Item
                </button>
              </form>
              {inventory.length > 0 && (
                <ul className="text-sm text-gray-600">
                  {inventory.map((i) => (
                    <li key={i._id}>• {i.name}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Staff Setup</h2>
              <p className="text-sm text-gray-600">Add staff and assign permissions (optional).</p>
              <form onSubmit={handleAddStaff} className="space-y-3">
                <input
                  value={staffForm.name}
                  onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Staff name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="flex gap-4">
                  {["inbox", "bookings", "forms", "inventory"].map((perm) => (
                    <label key={perm} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={staffForm.permissions[perm]}
                        onChange={(e) =>
                          setStaffForm((p) => ({
                            ...p,
                            permissions: { ...p.permissions, [perm]: e.target.checked },
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Staff
                </button>
              </form>
              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Skip / Next
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Activation</h2>
              {workspace?.isActive ? (
                <>
                  <p className="text-green-600">Workspace is already active.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <ul className="space-y-2 text-sm">
                    <li className={emailConnected ? "text-green-600" : "text-red-600"}>
                      {emailConnected ? "✓" : "✗"} Communication channel connected (from backend)
                    </li>
                    <li className={services?.length > 0 ? "text-green-600" : "text-red-600"}>
                      {services?.length > 0 ? "✓" : "✗"} At least one booking type
                    </li>
                    <li className={services?.some((s) => s.availability?.length) ? "text-green-600" : "text-red-600"}>
                      {services?.some((s) => s.availability?.length) ? "✓" : "✗"} Availability defined
                    </li>
                  </ul>
                  <button
                    onClick={handleActivate}
                    disabled={loading || !canActivate}
                    className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Activate Workspace
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
