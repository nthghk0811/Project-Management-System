// fe/src/components/layout/Header.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { globalSearchApi } from "../../api/searchApi";
import { getNotificationsApi, markNotificationReadApi } from "../../api/notificationApi"; 
import Logo from "../../assets/Icon.png";
import { formatDistanceToNow } from "date-fns";

export default function Header() {
  const { user, logout } = useAuth(); 
  const [openUser, setOpenUser] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const navigate = useNavigate();

  // ==== FIX LỖI "MẤT TRÍ NHỚ" CỦA AVATAR ====
  // Khởi tạo state bằng cách check LocalStorage TRƯỚC TIÊN
  const [displayUser, setDisplayUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : user;
  });

  // 1. Cập nhật lại nếu Context thay đổi (ví dụ: Logout)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setDisplayUser(JSON.parse(storedUser));
    } else {
      setDisplayUser(user);
    }
  }, [user]);

  // 2. Lắng nghe event update ngay tại chỗ (khi đang ở chung 1 trang)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser) setDisplayUser(updatedUser);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  // ===========================================

  // ==== SEARCH STATES ====
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); 
  const [isSearching, setIsSearching] = useState(false); 
  const searchRef = useRef(null);

  // Filters
  const [filterTime, setFilterTime] = useState("Any time");
  const [filterStatus, setFilterStatus] = useState([]);

  // ==== NOTIFICATION STATES ====
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Dùng displayUser để check quyền cho chính xác
  const isLeader = displayUser?.role === "Admin" || displayUser?.role === "Leader" || displayUser?.role?.toLowerCase() === "admin";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      setNotifications(res.data);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  const handleReadNoti = async (id, isRead) => {
    if (isRead) return;
    try {
      await markNotificationReadApi(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const statusParam = filterStatus.join(",");
        const res = await globalSearchApi(`${searchQuery}&time=${filterTime}&status=${statusParam}`);
        setSearchResults(res.data);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterTime, filterStatus]); 

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 relative z-[60]">
      
      {/* 1. LOGO */}
      <div className="flex items-center w-64">
        <Link 
          to={isLeader ? "/admin/dashboard" : "/dashboard"} 
          className="flex items-center hover:opacity-80 transition"
        >
          <img src={Logo} alt="Logo" className="h-10" />
        </Link>
      </div>

      {/* 2. THANH TÌM KIẾM JIRA-STYLE */}
      <div className="hidden md:flex flex-1 max-w-3xl px-8" ref={searchRef}>
        <div className="relative w-full">
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
              placeholder="Search projects, tasks, members..."
            />
          </div>

          {/* POPOVER JIRA SEARCH */}
          {isSearchOpen && (
            <div className="absolute top-12 left-0 w-full min-w-[700px] bg-white shadow-[0_15px_50px_-12px_rgba(0,0,0,0.2)] rounded-xl border border-slate-200 z-40 flex overflow-hidden max-h-[500px]">
              
              {/* CỘT TRÁI: KẾT QUẢ TÌM KIẾM */}
              <div className="w-3/5 flex flex-col border-r border-slate-100 bg-white">
                <div className="p-4 flex-1 overflow-y-auto">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {searchQuery ? "Matching Results" : "Type to search..."}
                  </h3>
                  
                  {isSearching ? (
                    <div className="text-center py-4 text-xs font-semibold text-slate-400 animate-pulse">
                      Searching universe... 🪐
                    </div>
                  ) : searchResults.length === 0 && searchQuery ? (
                     <div className="text-center py-4 text-xs text-slate-400">
                      No results found for "{searchQuery}" with current filters.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((item, index) => (
                        <div 
                          key={index} 
                          onClick={() => { setIsSearchOpen(false); navigate(item.url); }}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition"
                        >
                          <div className="flex items-center space-x-3">
                            {item.type === "Task" ? (
                              <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              </div>
                            ) : item.type === "Project" ? (
                              <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                              </div>
                            ) : (
                               <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                              </div>
                            )}
                            <div className="truncate max-w-[250px]">
                              <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600">{item.title}</p>
                              <p className="text-xs text-slate-400">{item.type} • #{item.id}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.status === 'Done' || item.status === 'Active' || item.status === 'Admin' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT PHẢI: BỘ LỌC TỐI GIẢN */}
              <div className="w-2/5 p-5 bg-slate-50/50 overflow-y-auto">
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Last Updated</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Any time", "Today", "Yesterday", "Past 7 days"].map((time) => (
                      <button 
                        key={time}
                        onClick={() => setFilterTime(time)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${filterTime === time ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Filter by Status (Tasks)</h4>
                  <div className="space-y-3">
                    {["To Do", "In Progress", "In Review", "Done"].map((status) => (
                      <label key={status} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filterStatus.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm" 
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MENU PHẢI (Chuông & Avatar) */}
      <div className="flex items-center space-x-6 relative">
        
        {/* NÚT CHUÔNG THÔNG BÁO */}
        <div>
          <button 
            onClick={() => { setOpenNoti(!openNoti); setOpenUser(false); setIsSearchOpen(false); }}
            className={`relative p-2 rounded-full transition ${openNoti ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {openNoti && (
            <div className="absolute right-12 top-12 mt-2 w-80 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">You're all caught up!</div>
                ) : (
                  notifications.map(noti => (
                    <div 
                      key={noti._id} 
                      onClick={() => handleReadNoti(noti._id, noti.isRead)}
                      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition ${noti.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                    >
                      <p className="text-sm font-bold text-slate-800">{noti.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{noti.desc}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">
                        {noti.createdAt ? formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                <span className="text-xs font-bold text-blue-600">Mark all as read</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        {/* NÚT AVATAR */}
        <div>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setOpenUser(!openUser); setOpenNoti(false); setIsSearchOpen(false); }}>
            <div className="text-right hidden md:block">
              <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition">{displayUser?.fullName}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{displayUser?.jobTitle || displayUser?.role || 'Member'}</p>
            </div>
            <img src={displayUser?.avatar || `https://ui-avatars.com/api/?name=${displayUser?.fullName || 'User'}&background=0D8ABC&color=fff`} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:border-blue-200 transition" />
          </div>

          {openUser && (
            <div className="absolute right-0 top-12 mt-2 w-60 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-800 truncate">{displayUser?.fullName}</p>
                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{displayUser?.email}</p>
              </div>
              <div className="py-2">
                <Link to="/profile" onClick={() => setOpenUser(false)} className="flex items-center px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition">Public Profile</Link>
                <Link to="/settings" onClick={() => setOpenUser(false)} className="flex items-center px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition">Personal Settings</Link>
                
                {/* HIỂN THỊ LINK TỚI ADMIN PORTAL NẾU LÀ ADMIN */}
                {isLeader && (
                  <Link to="/admin/dashboard" onClick={() => setOpenUser(false)} className="flex items-center px-5 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition">
                    <svg className="w-4 h-4 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Admin Portal
                  </Link>
                )}
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