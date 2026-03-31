// fe/src/pages/Register.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Icon.png";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await register(form);
      
      showToast("Registration successful! Redirecting...", "success");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* ==== TOAST MESSAGE CENTER MÀN HÌNH ==== */}
      {toast.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 backdrop-blur-[2px] bg-slate-900/20 transition-all">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl animate-fade-in-up font-bold text-white flex items-center max-w-md text-center leading-relaxed ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
            {toast.type === 'error' ? (
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ) : (
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ================= LEFT PANEL (BRANDING) ================= */}
      <div className="hidden lg:flex w-1/2 bg-[#1B2559] relative overflow-hidden items-center justify-center p-16">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#0b57d0] via-transparent to-transparent"></div>
        
        {/* CSS Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center w-64">
        <Link 
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition"
        >
          <div className="w-8 h-8 bg-[#0b57d0] rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
          </div>
          <span className="text-xl font-bold text-[#1B2559] tracking-tight">SyncBoard</span>
        </Link>
      </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight">
            Build software, <br/>not paperwork.
          </h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            Create an account to access the pragmatist's toolkit for project management. Start shipping faster today.
          </p>
          
          <div className="mt-10 bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-md">
            <p className="font-medium italic text-slate-200">"This tool cut our planning meetings in half. Everything is just... there."</p>
            <p className="mt-3 text-sm font-bold text-white">— Tech Lead at FastCorp</p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL (FORM) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-white">
        
        {/* Mobile Header */}
        <div className="p-6 lg:hidden flex justify-center border-b border-slate-100">
          <Link to="/"><img src={logo} alt="logo" className="h-8" /></Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-[400px]">
            
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold text-[#1B2559] tracking-tight mb-2">Create account</h1>
              <p className="text-slate-500 font-medium">Start managing your projects efficiently.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="e.g. Nguyen Van A"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-[#0b57d0] text-white py-3.5 mt-8 rounded-xl hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(11,87,208,0.39)] hover:shadow-[0_6px_20px_rgba(11,87,208,0.23)] hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed font-bold"
            >
              {isLoading ? (
                <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Creating account...</>
              ) : "Create Account"}
            </button>

            <p className="text-sm text-center text-slate-500 mt-8 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0b57d0] font-bold hover:underline transition">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}