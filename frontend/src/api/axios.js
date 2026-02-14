import axios from "axios";

const envBase = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE ? String(import.meta.env.VITE_API_BASE).trim() : null;
let BASE;
if (envBase) {
  const cleaned = envBase.endsWith("/") ? envBase.slice(0, -1) : envBase;
  BASE = cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
} else if (typeof window !== "undefined") {
  const host = window.location.hostname || "";
  const isLocal = host.includes("localhost") || host.startsWith("127.");
  // In production (not localhost) default to the deployed backend host
  BASE = isLocal ? "/api" : "https://care-ops-backend.vercel.app/api";
} else {
  BASE = "/api";
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
