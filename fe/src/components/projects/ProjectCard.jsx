// fe/src/components/projects/ProjectCard.jsx
import { Link } from "react-router-dom";
import { useState } from "react";

// BỔ SUNG: Nhận thêm prop `isLeader`
export default function ProjectCard({ project, activeTab, currentUserId, isLeader, onJoin, onAction }) {
  const [showMenu, setShowMenu] = useState(false);

  const ownerId = project.owner?._id || project.owner;
  const isOwner = String(ownerId) === String(currentUserId);
  
  // CHỐT CHẶN: Chỉ Owner hoặc Admin/Leader mới được xóa
  const canDelete = isOwner || isLeader; 

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); 
  };

  const getColorByText = (text) => {
    if (!text) return "bg-blue-600";
    const colors = ["bg-red-500", "bg-emerald-500", "bg-blue-600", "bg-amber-500", "bg-purple-600", "bg-indigo-500", "bg-pink-500"];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const projectInitial = project.name ? project.name.charAt(0).toUpperCase() : "P";
  const projectColor = getColorByText(project.name);

  const statusConfig = {
      planning: "bg-slate-100 text-slate-700 border-slate-200",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200"
  };

  return (
    <div className="relative group bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden">
      
      {/* 3 DOTS MENU */}
      {activeTab === 'my-projects' && (
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={(e) => { e.preventDefault(); setShowMenu(false); }}></div>
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden py-1 z-30 animate-fade-in-up">
                
                {/* NÚT LEAVE (Chỉ hiện nếu không phải Owner) */}
                {!isOwner && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onAction('leave'); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm font-semibold cursor-pointer transition text-amber-600 hover:bg-amber-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Leave Project
                  </button>
                )}

                {/* NÚT DELETE (Chỉ Admin/Leader hoặc Owner mới thấy) */}
                {canDelete && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onAction('delete'); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm font-semibold cursor-pointer transition text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Delete Project
                  </button>
                )}

              </div>
            </>
          )}
        </div>
      )}

      {/* CARD CONTENT */}
      <Link to={`/projects/${project._id}`} className="flex-1 flex flex-col p-5 relative z-10">
        <div className="flex items-start pr-8 mb-3">
          <div className={`w-8 h-8 rounded-md text-white flex items-center justify-center font-bold text-sm mr-3 shrink-0 shadow-sm ${projectColor}`}>
            {projectInitial}
          </div>
          <div>
            <h3 className="font-bold text-[16px] text-slate-800 leading-tight group-hover:text-blue-700 transition-colors line-clamp-1">{project.name}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Software project</p>
          </div>
        </div>

        <div className="text-[13px] text-slate-600 mb-5 flex-1 line-clamp-2 leading-relaxed">
          {project.description || "No project description provided."} 
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-[12px] font-semibold text-slate-500">
             <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             {formatDate(project.endDate)}
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${statusConfig[project.status] || statusConfig.planning}`}>
              {project.status || "Planning"}
          </span>
        </div>

        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={project.owner?.avatar || `https://ui-avatars.com/api/?name=${project.owner?.fullName || 'U'}&background=e2e8f0&color=475569`} 
                alt="Owner" 
                className="w-6 h-6 rounded-full border border-slate-200"
                title={`Project Lead: ${project.owner?.fullName || 'Unknown'}`}
              />
              {activeTab === 'my-projects' && (
                <span className="text-[12px] font-semibold text-slate-500 ml-2">Lead</span>
              )}
            </div>
            
            {activeTab === 'discover' ? (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onJoin(); }}
                className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer active:scale-95"
              >
                Join Project
              </button>
            ) : (
              <div className="flex items-center text-slate-500 text-[12px] font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {project.taskCount || 0} issues
              </div>
            )}
        </div>
      </Link>
    </div>
  );
}