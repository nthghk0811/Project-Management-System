import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Icon.png";

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [localUser, setLocalUser] = useState(user); // State cục bộ để cập nhật tức thời
  const navigate = useNavigate();

  // Lắng nghe sự thay đổi của LocalStorage từ trang Settings
  useEffect(() => {
    // 1. Lấy data mới nhất lúc vừa load xong Header
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setLocalUser(storedUser);

    // 2. Bật "tai nghe" rình xem có ai đổi Profile không
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser) setLocalUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Ưu tiên dùng user mới nhất trong Local, nếu không có mới xài tạm AuthContext
  const displayUser = localUser || user;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 relative shadow-sm">
      <Link to="/dashboard" className="flex items-center hover:opacity-80 transition">
        <img src={Logo} alt="Logo" className="h-10" />
      </Link>

      <div className="relative">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setOpen(!open)}
        >
          <div className="text-right hidden md:block">
            <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition">{displayUser?.fullName}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{displayUser?.jobTitle || displayUser?.role || 'Member'}</p>
          </div>
          
          {/* Đã thay Pravatar bằng UI-Avatars chuẩn doanh nghiệp */}
          <img
            src={
              displayUser?.avatar ||
              `https://ui-avatars.com/api/?name=${displayUser?.fullName || 'User'}&background=0D8ABC&color=fff`
            }
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:border-blue-200 transition"
          />
          
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>

        {/* Dropdown Menu - Cập nhật UI Jira */}
        {open && (
          <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-sm font-bold text-slate-800 truncate">{displayUser?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{displayUser?.email}</p>
            </div>
            
            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Public Profile
              </Link>
              
              {/* Thêm link sang Settings */}
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Personal Settings
              </Link>
            </div>

            <div className="border-t border-slate-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}