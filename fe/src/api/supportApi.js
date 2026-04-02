import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/support";


export const createSupportTicketApi = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(API, data, { headers: { Authorization: `Bearer ${token}` } });
};

export const getAllSupportTicketsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
};