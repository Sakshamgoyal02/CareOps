import api from "./axios.js";

export const getUsers = () => api.get("/users").then((r) => r.data);
export const createStaff = (data) =>
  api.post("/users", data).then((r) => r.data);
