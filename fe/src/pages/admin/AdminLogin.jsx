// fe/src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginApi } from "../../api/authApi"; 
import { useAuth } from "../../context/AuthContext"; // Dùng để update state đăng nhập nếu cần
import Logo from "../../assets/Icon.png"; // Thay đường dẫn logo của bạn vào đây

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  // Giả sử AuthContext của bạn có hàm login để set state
  const { setUser } = useAuth(); 

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      
      const res = await adminLoginApi({ email, password });
      
      // Lưu token và user vào localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // CHỈ CẬP NHẬT STATE, KHÔNG GỌI API LOGIN NỮA
      setUser(res.data.user);

      // Chuyển hướng thẳng vào Admin Dashboard
      navigate("/admin/dashboard");

    } catch (err) {
        console.log(err);
      setError(err.response?.data?.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4 font-sans">
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={Logo} alt="Logo" className="h-12 mb-6" />
          <h1 className="text-2xl font-bold text-[#1B2559] tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your workspace.</p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition text-sm"
                placeholder="admin@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-[#0b57d0] hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                "Sign In to Admin"
              )}
            </button>

          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Are you a team member? <a href="/login" className="text-[#0b57d0] hover:underline font-bold">Go to User Login</a>
          </p>
        </div>

      </div>
    </div>
  );
}