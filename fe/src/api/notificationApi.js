import axios from "axios";
const API_URL = "http://localhost:8080/api/notifications"; // Chỉnh port cho đúng

export const getNotificationsApi = () => {
  return axios.get(API_URL, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
};

export const markNotificationReadApi = (id) => {
  return axios.put(`${API_URL}/${id}/read`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
};