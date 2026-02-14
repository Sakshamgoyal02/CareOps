import api from "./axios.js";

export const getDashboard = () => api.get("/dashboard").then((r) => r.data);
