import axios from "axios";

const base = process.env.NEXT_PUBLIC_ADMIN_API_BASE?.replace(/\/$/, "");

export const api = axios.create({
  baseURL: base ? `${base}/api/website` : "/api/website",
  withCredentials: true,
});

