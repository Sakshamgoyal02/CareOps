import api from "./axios.js";

export const getServices = () => api.get("/services").then((r) => r.data);
export const createService = (data) =>
  api.post("/services", data).then((r) => r.data);
