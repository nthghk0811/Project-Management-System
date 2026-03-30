// fe/src/components/layout/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { createSupportTicketApi } from "../../api/supportApi";


export default function Sidebar() {
  const { user } = useAuth(); // Lấy thông tin user
  const [showSupport, setShowSupport] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const isLeader = user?.role === "Admin" || user?.role === "Leader" || user?.role?.toLowerCase() === "admin";


const menu = [
    { 
      name: "Dashboard", 
      path: isLeader ? "/admin/dashboard" : "/dashboard", // Đổi đường dẫn thông minh
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> 
    },
    { name: "Projects", path: "/projects", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
    { name: "Tasks", path: "/tasks", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { name: "Work Logs", path: "/worklogs", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { name: "Performance", path: "/performance", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /> },
    
    // THÊM MENU RIÊNG CHỈ DÀNH CHO ADMIN
    ...(isLeader ? [{ 
      name: "Approvals", 
      path: "/admin/approval", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    }] : []),

    { name: "Settings", path: "/settings", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
  ];


  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSendSupport = async (e) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    
    try {
      await createSupportTicketApi({ message: supportText });
      
      setShowSupport(false);
      setSupportText("");
      showToast("Your support request has been sent to the Admin.");
    } catch (error) {
      showToast("Failed to send message. Please try again.");
      console.error(error);
    }
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center">
          <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {toastMessage}
        </div>
      )}

      <div className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-64px)] flex flex-col shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menu.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-blue-50 text-[#0b57d0] font-bold" : "text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-800"}`}>
              {({ isActive }) => (
                <>
                  <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-[#0b57d0]' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* NÚT HELP & SUPPORT (Chỉ hiển thị cho Member) */}
        {!isLeader && (
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => setShowSupport(true)}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Help & Support</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL SUPPORT */}
      {showSupport && !isLeader && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Contact Support
              </h3>
              <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-slate-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSendSupport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">How can we help you?</label>
                <textarea 
                  autoFocus
                  required
                  rows="4"
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  placeholder="Describe your issue or feedback here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowSupport(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#0b57d0] text-white hover:bg-blue-700 shadow-sm transition">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}