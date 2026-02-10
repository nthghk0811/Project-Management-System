import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi, getMeApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // kiểm tra token khi mở app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMeApi(token)
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    const res = await loginApi(data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const register = async (data) => {
    const res = await registerApi(data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
