import axios from "axios";

const base = process.env.NEXT_PUBLIC_ADMIN_API_BASE?.replace(/\/$/, "");

export const api = axios.create({
  baseURL: base ? `${base}/api/website` : "/api/website",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});
