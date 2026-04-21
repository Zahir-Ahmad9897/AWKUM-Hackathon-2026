// ─── Axios API Client ───
// Base configuration for all API calls

import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("trustfund_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("trustfund_token");
      localStorage.removeItem("trustfund_user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  me: () => API.get("/auth/me"),
};

// ─── Campaigns API ───
export const campaignsAPI = {
  getAll: (params) => API.get("/campaigns", { params }),
  getOne: (id) => API.get(`/campaigns/${id}`),
  create: (data, config) => API.post("/campaigns", data, config),
  update: (id, data) => API.put(`/campaigns/${id}`, data),
  delete: (id) => API.delete(`/campaigns/${id}`),
  getMine: () => API.get("/campaigns/mine"),
};

// ─── Donations API ───
export const donationsAPI = {
  donate: (data, config) => API.post("/donations", data, config),
  getReceipt: (txId) => API.get(`/donations/receipt/${txId}`),
  getCampaignDonations: (id) => API.get(`/donations/campaign/${id}`),
};

// ─── Withdrawals API ───
export const withdrawalsAPI = {
  request: (data) => API.post("/withdrawals", data),
  getForCampaign: (id) => API.get(`/withdrawals/campaign/${id}`),
  review: (id, data) => API.put(`/withdrawals/${id}/review`, data),
};

// ─── NGO API ───
export const ngoAPI = {
  apply: (data) => API.post("/ngo/apply", data),
  getPendingCampaigns: () => API.get("/ngo/campaigns/pending"),
  verifyCampaign: (id, data) => API.put(`/ngo/campaigns/${id}/verify`, data),
};

// ─── Admin API ───
export const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  getUsers: (params) => API.get("/admin/users", { params }),
  getPendingNGOs: () => API.get("/admin/ngo/pending"),
  reviewNGO: (id, data) => API.put(`/admin/ngo/${id}/review`, data),
};

// ─── Reports API ───
export const reportsAPI = {
  create: (data) => API.post("/reports", data),
  list: (params) => API.get("/reports", { params }),
  resolve: (id, data) => API.put(`/reports/${id}/resolve`, data),
};

// ─── Public Stats API (no auth required) ───
export const statsAPI = {
  getPublic: () => API.get("/stats"),
};

export default API;
