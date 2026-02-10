// pages/Register.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Icon.png";
import image from "../assets/login.png";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="p-6 text-2xl font-bold">
        <Link to="/dashboard"><img src={logo} /></Link>
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
                className="w-full border-b p-2 outline-none focus:border-black"
                onChange={handleChange}
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border-b p-2 outline-none focus:border-black"
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border-b p-2 outline-none focus:border-black"
                onChange={handleChange}
                required
              />
            </div>

            <button className="w-full bg-black text-white py-3 rounded-lg">
              Sign up
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
