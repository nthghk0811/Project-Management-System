import axios from "axios";

const API = "http://localhost:8080/api/projects";

export const createProjectApi = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMyProjectsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getProjectByIdApi = (id) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getDiscoverProjectsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/discover`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tham gia dự án
export const joinProjectApi = (projectId) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/${projectId}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Rời khỏi dự án
export const leaveProjectApi = (projectId) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/${projectId}/leave`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Xóa dự án (Chỉ dành cho Owner)
export const deleteProjectApi = (projectId) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API}/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// fe/src/api/projectApi.js

// ... các hàm API cũ

export const updateProjectApi = (id, data) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};