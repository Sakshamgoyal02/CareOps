import api from "./axios.js";

export const registerOwner = (data) =>
  api.post("/auth/register-owner", data).then((r) => r.data);

export const login = (data) =>
  api.post("/auth/login", data).then((r) => r.data);
