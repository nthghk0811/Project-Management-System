import axios from "axios";

const API = "http://localhost:8080/api/projects";

export const createProjectApi = (data) => {
  const token = localStorage.getItem("token");

  return axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMyProjectsApi = () => {
  const token = localStorage.getItem("token");

  return axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};