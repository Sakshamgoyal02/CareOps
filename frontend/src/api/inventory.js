import api from "./axios.js";

export const getInventory = () => api.get("/inventory").then((r) => r.data);
export const createInventoryItem = (data) =>
  api.post("/inventory", data).then((r) => r.data);
