// fe/src/components/projects/ProjectCard.jsx
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProjectCard({ project, activeTab, currentUserId, onJoin, onAction }) {
  const [showMenu, setShowMenu] = useState(false);

  // DEBUG: Mở F12 (Console) để xem tại sao bạn không thấy nút Delete
  const ownerId = project.owner?._id || project.owner;
  const isOwner = String(ownerId) === String(currentUserId);
  // console.log("Owner ID:", ownerId, "| Current User ID:", currentUserId, "| isOwner:", isOwner);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(); 
  };

  const getInitials = (name) => {
      if (!name) return "U";
      const parts = name.split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
  };

  const statusConfig = {
      planning: "bg-emerald-100 text-emerald-500",
      active: "bg-blue-100 text-blue-500",
      completed: "bg-slate-100 text-slate-500"
  };

  return (
    <div className="relative group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full">
      
      {activeTab === 'my-projects' && (
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              setShowMenu(!showMenu); 
            }}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-6 w-36 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden py-1 z-30">
              {/* Nếu là Owner -> Hiện chữ Delete, nếu là Member -> Hiện chữ Leave */}
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setShowMenu(false); 
                  onAction(); // Gọi chung 1 hàm duy nhất
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium cursor-pointer ${
                  isOwner ? "text-red-600 hover:bg-red-50" : "text-orange-600 hover:bg-orange-50"
                }`}
              >
                {isOwner ? "Delete Project" : "Leave Project"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ... Phần bên dưới giữ nguyên nội dung hiển thị ... */}
      <Link to={`/projects/${project._id}`} className="flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-4 pr-8">
          <h3 className="font-bold text-[17px] text-slate-800 line-clamp-1 w-2/3">{project.name}</h3>
          <span className={`px-2.5 py-0.5 text-[11px] font-bold capitalize rounded-full ${statusConfig[project.status] || statusConfig.planning}`}>
              {project.status || "Planning"}
          </span>
        </div>

        <div className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">
          {project.description || "No description provided."} 
        </div>

        <div className="text-[13px] font-semibold text-red-500 mb-5">
            Deadline : {formatDate(project.endDate)}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] font-bold tracking-wider">
                {getInitials(project.owner?.fullName || "U")}
            </div>
            
            {activeTab === 'discover' ? (
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  onJoin(); 
                }}
                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
              >
                Join
              </button>
            ) : (
              <div className="flex items-center text-slate-400 text-[13px] font-medium">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {project.taskCount || 0} issues
              </div>
            )}
        </div>
      </Link>
    </div>
  );
}