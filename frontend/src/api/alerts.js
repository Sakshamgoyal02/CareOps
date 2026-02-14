import api from "./axios.js";

export const getAlerts = () => api.get("/alerts").then((r) => r.data);
export const resolveAlert = (id) =>
  api.patch(`/alerts/${id}/resolve`).then((r) => r.data);
