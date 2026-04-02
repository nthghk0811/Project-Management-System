import axios from "axios";

// Lấy link API từ file .env, nếu không có thì mặc định lấy localhost (để code ở máy không bị lỗi)
const BASE_URL = process.env.REACT_APP_API_URL 

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export const loginApi = (data) => API.post("/auth/login", data);
export const registerApi = (data) => API.post("/auth/register", data);
export const getMeApi = (token) =>
  API.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllUsersApi = () => {
  const token = localStorage.getItem("token");
  // Dùng instance API đã tạo, đường dẫn sẽ tự ghép thành <BASE_URL>/api/auth/users
  return API.get("/auth/users", { 
    headers: { Authorization: `Bearer ${token}` }
  });
};