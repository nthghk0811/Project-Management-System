import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Icon.png";
import image from "../assets/login.png";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await register(form);
      
      showToast("Registration successful! Redirecting...", "success");
      
      // Delay 1.5s để user kịp thấy thông báo rồi mới chuyển trang
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      
      {/* ==== GLOBAL TOAST NOTIFICATION ==== */}
      {toast.show && (
        <div className={`fixed top-10 right-8 px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fade-in-up font-bold text-sm flex items-center text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="p-6 text-2xl font-bold">
        <Link to="/dashboard"><img src={logo} alt="logo" /></Link>
      </div>

      {/* BODY */}
      <div className="flex flex-1">
        {/* LEFT IMAGE */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100">
          <img src={image} alt="register" className="max-h-[500px]" />
        </div>

        {/* RIGHT FORM */}
        <div className="flex w-full md:w-1/2 items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-[350px] space-y-5"
          >
            <div>
              <h1 className="text-3xl font-bold">Create account</h1>
              <p className="text-gray-500">Start managing your projects.</p>
            </div>

            <div className="space-y-4">
              <input
                name="fullName"
                type="text"
                placeholder="Full name"
                className="w-full border-b p-2 outline-none focus:border-black transition-colors"
                onChange={handleChange}
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border-b p-2 outline-none focus:border-black transition-colors"
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border-b p-2 outline-none focus:border-black transition-colors"
                onChange={handleChange}
                required
              />
            </div>

            <button 
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing up...
                </>
              ) : "Sign up"}
            </button>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="underline font-medium">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}