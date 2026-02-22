import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Icon.png";

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6 relative">
      <Link to="/dashboard">
        <img src={Logo} alt="Logo" className="h-12" />
      </Link>

      <div className="relative">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <img
            src={
              user?.avatar ||
              "https://i.pravatar.cc/40"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="font-semibold">{user?.fullName}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>
        </div>

        {open && (
          <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg border z-50">
            <Link
              to="/profile"
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}