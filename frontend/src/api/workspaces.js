import api from "./axios.js";

export const getWorkspace = () => api.get("/workspaces/me").then((r) => r.data);
export const getIntegrationStatus = () =>
  api.get("/workspaces/integration-status").then((r) => r.data);
export const updateWorkspace = (data) =>
  api.patch("/workspaces/me", data).then((r) => r.data);
export const activateWorkspace = () =>
  api.post("/workspaces/activate").then((r) => r.data);
