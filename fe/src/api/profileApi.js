import axios from "axios";

const API = "http://localhost:8080/api/users/me";

export const getProfileApi = () => {
  const token = localStorage.getItem("token");

  return axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfileApi = (data) => {
  const token = localStorage.getItem("token");

  return axios.put(API, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const changePasswordApi = (data) => {
  const token = localStorage.getItem("token");

  return axios.put(
    "http://localhost:8080/api/users/change-password",
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
  return axios.post("http://localhost:8080/api/users/upload-avatar", formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data" // Bắt buộc phải có dòng này khi up file
    },
  });
};