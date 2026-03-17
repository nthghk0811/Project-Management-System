// fe/src/components/layout/Header.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Icon.png";

export default function Header() {
  const { user, logout } = useAuth();
  const [openUser, setOpenUser] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const navigate = useNavigate();

  // ==== STATE CHO JIRA SEARCH ====
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  // Filter States
  const [filterTime, setFilterTime] = useState("Any time");
  const [filterStatus, setFilterStatus] = useState([]);

  // Mock Data: Lịch sử hoặc Kết quả tìm kiếm (Dựa trên data bạn đang có)
  const mockRecentItems = [
    { id: "T-102", type: "Task", title: "Thiết kế giao diện Admin Login", status: "Done" },
    { id: "T-105", type: "Task", title: "Viết API duyệt tham gia dự án", status: "In Progress" },
    { id: "P-01", type: "Project", title: "Project Management System (SCRUM)", status: "Active" },
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setLocalUser(storedUser);

    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser) setLocalUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Xử lý click ra ngoài để đóng Search Box
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayUser = localUser || user;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const toggleStatusFilter = (status) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter((s) => s !== status));
    } else {
      setFilterStatus([...filterStatus, status]);
    }
  };

  return (
    <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 relative z-50">
      
      {/* 1. LOGO TRÁI */}
      <div className="flex items-center w-64">
        <Link to="/dashboard" className="flex items-center hover:opacity-80 transition">
          <img src={Logo} alt="Logo" className="h-8" />
          <span className="ml-3 font-extrabold text-xl tracking-tight text-[#1B2559]">AProjectO</span>
        </Link>
      </div>

      {/* 2. THANH TÌM KIẾM JIRA-STYLE Ở GIỮA */}
      <div className="hidden md:flex flex-1 max-w-3xl px-8" ref={searchRef}>
        <div className="relative w-full">
          
          {/* Thanh Input */}
          <div className={`flex items-center border ${isSearchOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:bg-slate-50'} bg-white rounded-lg transition-all z-50 relative`}>
            <div className="pl-3 pointer-events-none">
              <svg className={`h-5 w-5 ${isSearchOpen ? 'text-blue-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchSubmit}
              className="block w-full pl-2 pr-3 py-2 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none sm:text-sm"
              placeholder="Search Jira..."
            />
          </div>

          {/* POPOVER JIRA SEARCH KHỔNG LỒ */}
          {isSearchOpen && (
            <div className="absolute top-12 left-0 w-full min-w-[700px] bg-white shadow-[0_15px_50px_-12px_rgba(0,0,0,0.2)] rounded-xl border border-slate-200 z-40 flex overflow-hidden max-h-[500px]">
              
              {/* CỘT TRÁI: RECENTLY VIEWED / KẾT QUẢ */}
              <div className="w-3/5 border-r border-slate-100 flex flex-col">
                <div className="p-4 border-b border-slate-100 flex space-x-4 text-sm font-semibold text-slate-500">
                  <button className="text-blue-600 border-b-2 border-blue-600 pb-1">Jira</button>
                  <button className="hover:text-slate-800 pb-1">Projects</button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {searchQuery ? "Matching Results" : "Recently Viewed"}
                  </h3>
                  
                  <div className="space-y-1">
                    {mockRecentItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition">
                        <div className="flex items-center space-x-3">
                          {/* Icon tùy theo loại */}
                          {item.type === "Task" ? (
                            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                          )}
                          <div className="truncate max-w-[250px]">
                            <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.id}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.status === 'Done' || item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Cột Trái */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 flex justify-between items-center">
                  <div className="flex space-x-3">
                    <span className="text-slate-400">Go to all:</span>
                    <button className="hover:text-blue-600">Projects</button>
                    <button className="hover:text-blue-600">Tasks</button>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: BỘ LỌC (FILTERS) */}
              <div className="w-2/5 p-5 bg-slate-50/50 overflow-y-auto">
                
                {/* Last Updated */}
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Updated</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Any time", "Today", "Yesterday", "Past 7 days"].map((time) => (
                      <button 
                        key={time}
                        onClick={() => setFilterTime(time)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filterTime === time ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter by Status */}
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filter by Status</h4>
                  <div className="space-y-2">
                    {["To Do", "In Progress", "In Review", "Done"].map((status) => (
                      <label key={status} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filterStatus.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Search Link */}
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <button 
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate("/search");
                    }}
                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    Advanced search
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MENU PHẢI (Chuông & Avatar - Giữ nguyên logic cũ) */}
      <div className="flex items-center space-x-6">
        
        {/* NÚT CHUÔNG */}
        <div className="relative">
          <button 
            onClick={() => { setOpenNoti(!openNoti); setOpenUser(false); setIsSearchOpen(false); }}
            className={`relative p-2 rounded-full transition ${openNoti ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          {/* ... (Phần UI Dropdown chuông giữ nguyên) ... */}
        </div>

        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        {/* NÚT AVATAR */}
        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setOpenUser(!openUser); setOpenNoti(false); setIsSearchOpen(false); }}
          >
            <div className="text-right hidden md:block">
              <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition">{displayUser?.fullName}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{displayUser?.jobTitle || displayUser?.role || 'Member'}</p>
            </div>
            <img src={displayUser?.avatar || `https://ui-avatars.com/api/?name=${displayUser?.fullName || 'User'}&background=0D8ABC&color=fff`} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:border-blue-200 transition" />
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${openUser ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          {/* ... (Phần UI Dropdown User giữ nguyên) ... */}
          {openUser && (
            <div className="absolute right-0 mt-3 w-60 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-800 truncate">{displayUser?.fullName}</p>
                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{displayUser?.email}</p>
              </div>
              <div className="py-2">
                <Link to="/profile" onClick={() => setOpenUser(false)} className="flex items-center px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition">Public Profile</Link>
                <Link to="/settings" onClick={() => setOpenUser(false)} className="flex items-center px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition">Personal Settings</Link>
              </div>
              <div className="border-t border-slate-100 py-2">
                <button onClick={handleLogout} className="w-full flex items-center px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition">Log out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}