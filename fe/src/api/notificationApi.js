// fe/src/api/notificationApi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL  + "/api/notifications";

export const getNotificationsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
};

export const markNotificationReadApi = (id) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API}/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// HÀM BẮN LOA PHƯỜNG DÀNH CHO ADMIN
export const sendGlobalNotificationApi = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/global`, data, { headers: { Authorization: `Bearer ${token}` } });
};

export const markAllNotificationsReadApi = () => {
  const token = localStorage.getItem("token");
  return axios.put(`${API}/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

export const sendPrivateNotificationApi = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/private`, data, { headers: { Authorization: `Bearer ${token}` } });
};