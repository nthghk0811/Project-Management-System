import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Logo from "../../assets/Icon.png";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      {/* Logo */}
      <Link to="/dashboard" className="text-xl font-bold">
        <img src={Logo} alt="Logo" className="h-13" />
      </Link>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">{user?.fullName}</p>
          <p className="text-sm text-gray-500">{user?.role}</p>
        </div>

        <button
          onClick={logout}
          className="bg-black text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
