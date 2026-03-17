// fe/src/api/searchApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/search";

export const globalSearchApi = (query) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};