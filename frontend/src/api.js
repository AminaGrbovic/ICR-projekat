import axios from "axios";

export const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const http = axios.create({ baseURL: apiBaseUrl, headers: { "Content-Type": "application/json" } });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("vet-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(error) {
  const data = error?.response?.data;
  const fieldErrors = data?.errors
    ? Object.entries(data.errors).flatMap(([field, messages]) =>
        (Array.isArray(messages) ? messages : [messages]).map((message) => `${field}: ${message}`),
      )
    : [];
  return fieldErrors.length
    ? `${data?.message || "Please check the form."} ${fieldErrors.join(" ")}`
    : data?.message || error?.message || "Something went wrong. Please try again.";
}

const request = (method, url, data) => http.request({ method, url, data }).then(({ data: result }) => result);
const resource = (path) => ({
  list: () => request("get", path),
  get: (id) => request("get", `${path}/${id}`),
  create: (data) => request("post", path, data),
  update: (id, data) => request("put", `${path}/${id}`, data),
  remove: (id) => request("delete", `${path}/${id}`),
});

export const api = {
  welcome: () => axios.get("/backend-welcome").then(({ data }) => data),
  health: () => request("get", "/health"),
  register: (data) => request("post", "/owners/register", data),
  login: (data) => request("post", "/login", data),
  vetsCount: () => request("get", "/public/vets-count"),
  medicines: resource("/medicine"),
  owners: {
    list: () => request("get", "/owners"),
    me: () => request("get", "/owners/me"),
    updateMe: (data) => request("put", "/owners/me", data),
    get: (id) => request("get", `/owners/${id}`),
    update: (id, data) => request("put", `/owners/${id}`, data),
    remove: (id) => request("delete", `/owners/${id}`),
  },
  pets: resource("/pets"),
  vets: resource("/vets"),
  reservations: {
    list: () => request("get", "/reservations"),
    create: (data) => request("post", "/reservations", data),
    remove: (id) => request("delete", `/reservations/${id}`),
  },
};

export default api;
