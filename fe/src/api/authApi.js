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

// export const adminLoginApi = (data) => API.post("/auth/admin/login", data);

export const getAllUsersApi = () => {
  const token = localStorage.getItem("token");
  // Dùng instance API đã tạo, đường dẫn sẽ tự ghép thành http://localhost:8080/api/auth/users
  return API.get("/auth/users", { 
    headers: { Authorization: `Bearer ${token}` }
  });
};