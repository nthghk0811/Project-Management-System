// fe/src/pages/Projects.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ProjectCard from "../components/projects/ProjectCard";
import { getMyProjectsApi, getDiscoverProjectsApi, joinProjectApi, deleteProjectApi, leaveProjectApi } from "../api/projectApi";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('my-projects'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id; 
  const isLeader = user.role === "Leader" || user.role === "Admin" || user.role?.toLowerCase() === "admin";

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = activeTab === 'my-projects' 
        ? await getMyProjectsApi() 
        : await getDiscoverProjectsApi();
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    setCurrentPage(1);
    setSearchQuery("");
  }, [activeTab]);

  const handleJoin = async (projectId) => {
    try {
      await joinProjectApi(projectId);
      alert("Join request sent to the Admin! Please wait for approval.");
    } catch (error) {
      console.error(error);
      alert("Failed to send join request.");
    }
  };

  const handleAction = async (project, actionType) => {
    if (actionType === 'delete') {
      const confirmMessage = "This action will permanently delete the project and all its tasks. Are you sure you want to proceed?";
      if (!window.confirm(confirmMessage)) return;
      
      try {
        await deleteProjectApi(project._id); 
        setProjects(prev => prev.filter(p => p._id !== project._id));
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting project.");
      }
    } else if (actionType === 'leave') {
      if (!window.confirm("Are you sure you want to request to leave this project? The Admin must approve this action.")) return;
      
      try {
        await leaveProjectApi(project._id);
        alert("Leave request sent to the Admin. Please continue your tasks until approved.");
      } catch (error) {
        alert(error.response?.data?.message || "Error sending leave request.");
      }
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* HEADER SECTION (Chuẩn Jira) */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
             <div>
              <h1 className="text-2xl font-bold text-[#1B2559] tracking-tight">Projects</h1>
              
              {/* TABS (Dạng Toggle Switch của SaaS) */}
              <div className="flex bg-slate-200/60 p-1 rounded-lg mt-4 w-fit border border-slate-200/50">
                <button 
                  onClick={() => setActiveTab('my-projects')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'my-projects' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  My Projects
                </button>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'discover' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Discover All
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* SEARCH INPUT CÓ ICON */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm transition"
                />
              </div>
              
              {isLeader && (
                <button 
                  onClick={() => navigate('/admin/projects/create')} 
                  className="bg-[#0b57d0] text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm font-bold text-sm flex items-center whitespace-nowrap transition active:scale-95"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Create project
                </button>
              )}
            </div>
          </div>

          {/* PROJECT LIST */}
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          ) : currentProjects.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-800">No projects found</h3>
               <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentProjects.map((p) => (
                <ProjectCard 
                  key={p._id} 
                  project={p} 
                  activeTab={activeTab}
                  currentUserId={currentUserId}
                  isLeader={isLeader}
                  onJoin={() => handleJoin(p._id)}
                  onAction={(actionType) => handleAction(p, actionType)}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition ${currentPage === pageNum ? 'bg-[#0b57d0] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}