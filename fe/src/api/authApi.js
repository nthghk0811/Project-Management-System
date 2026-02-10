import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const loginApi = (data) => API.post("/auth/login", data);
export const registerApi = (data) => API.post("/auth/register", data);
export const getMeApi = (token) =>
  API.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

