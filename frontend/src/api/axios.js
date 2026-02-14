import axios from "axios";

const rawBase = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE ? import.meta.env.VITE_API_BASE : null;
let BASE;
if (!rawBase) {
  BASE = "/api";
} else {
  // normalize: remove trailing slash then ensure it ends with /api
  let b = rawBase.trim();
  if (b.endsWith("/")) b = b.slice(0, -1);
  if (!b.endsWith("/api")) b = b + "/api";
  BASE = b;
}

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("careops_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("careops_token");
      localStorage.removeItem("careops_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
