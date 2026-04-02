// fe/src/api/userApi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/users";

const getConfig = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAllUsersApi = () => axios.get(`${API}/admin/all`, getConfig());
export const updateUserRoleApi = (id, role) => axios.put(`${API}/admin/${id}/role`, { role }, getConfig());
export const deleteUserApi = (id) => axios.delete(`${API}/admin/${id}`, getConfig());

export const createUserApi = (data) => axios.post(API, data, getConfig());