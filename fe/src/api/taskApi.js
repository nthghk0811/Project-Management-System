// fe/src/api/taskApi.js
import axios from "axios";

const API = "http://localhost:8080/api/tasks";

export const getTasksByProjectApi = (projectId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createTaskApi = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteTaskApi = (ids) => {
  const token = localStorage.getItem("token");
  // Wrap ids in an object to ensure Express parses req.body.ids easily
  return axios.post(`${API}/delete`, { ids }, { 
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateTaskApi = (taskId, data) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API}/${taskId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }); 
};

export const getGlobalTasksApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/global`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addTaskCommentApi = (taskId, comment) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/${taskId}/comments`, { text: comment }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const toggleTaskTimerApi = (taskId) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API}/${taskId}/timer`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTaskStatisticsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getRecentActivitiesApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getWorkLogsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/worklogs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPerformanceDataApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};