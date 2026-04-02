import axios from "axios";

// Khai báo biến môi trường chung trên đầu file
const BASE_URL = process.env.REACT_APP_API_URL;

// API cứng cho profile
const PROFILE_API = `${BASE_URL}/api/users/me`;

export const getProfileApi = () => {
  const token = localStorage.getItem("token");

  return axios.get(PROFILE_API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfileApi = (data) => {
  const token = localStorage.getItem("token");

  return axios.put(PROFILE_API, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePasswordApi = (data) => {
  const token = localStorage.getItem("token");

  return axios.put(
    `${BASE_URL}/api/users/change-password`, // Thay URL cứng bằng biến
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const uploadAvatarApi = (formData) => {
  const token = localStorage.getItem("token");
  
  return axios.post(`${BASE_URL}/api/users/upload-avatar`, formData, { // Thay URL cứng bằng biến
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data" 
    },
  });
};