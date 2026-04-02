// fe/src/pages/Projects.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ProjectCard from "../components/projects/ProjectCard";
import { getMyProjectsApi, getDiscoverProjectsApi, joinProjectApi, deleteProjectApi, leaveProjectApi, updateProjectApi } from "../api/projectApi";
import { io } from "socket.io-client"; 

export default function Projects() {
const api = import.meta.env.VITE_API_URL;

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [toast, setToast] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, actionType: null, project: null, title: "", message: "" });
  const [editModal, setEditModal] = useState({ isOpen: false, project: null });
  const [editFormData, setEditFormData] = useState({ name: "", type: "", description: "", startDate: "", endDate: "" });

  const [activeTab, setActiveTab] = useState('my-projects'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  const navigate = useNavigate();

  const { user } = useAuth(); // Sửa localStorage thành useAuth cho chuẩn
  const currentUserId = user?._id || user?.id; 
  const isLeader = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "leader";

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000); 
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = activeTab === 'my-projects' ? await getMyProjectsApi() : await getDiscoverProjectsApi();
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  // socket
  useEffect(() => {
    const socket = io(`${api}`);

    socket.on("connect", () => {
      console.log("Projects Page: Đã kết nối Socket!");
    });

    // Nghe đài "project_list_updated" (khi có ai đó tạo mới hoặc xóa dự án)
    socket.on("project_list_updated", () => {
      console.log("ok");
      fetchProjects(); // Reload lại danh sách ngầm
    });

    // Nghe đài "project_updated" (được emit từ updateProject của file project.controller)
    socket.on("project_updated", () => {
       console.log("changed");
       fetchProjects();
    });

    return () => {
      socket.disconnect(); // Rời khỏi trang thì rút tai nghe ra
    };
  }, [activeTab]); 

  useEffect(() => {
    fetchProjects();
    setCurrentPage(1);
    setSearchQuery("");
  }, [activeTab]);

  const handleJoin = async (projectId) => {
    try {
      const res = await joinProjectApi(projectId);
      showToast(res.data?.message || "Action successful!");
      fetchProjects();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send join request.");
    }
  };

  const handleActionClick = (project, actionType) => {
    if (actionType === 'edit') {
      setEditFormData({
        name: project.name || "",
        type: project.type || "",
        description: project.description || "",
        startDate: project.startDate ? project.startDate.split('T')[0] : "",
        endDate: project.endDate ? project.endDate.split('T')[0] : ""
      });
      setEditModal({ isOpen: true, project });
    } else if (actionType === 'delete') {
      setConfirmModal({ isOpen: true, actionType: 'delete', project: project, title: "Delete Project?", message: `This action will permanently delete "${project.name}" and all its tasks. Are you sure you want to proceed?` });
    } else if (actionType === 'leave') {
      setConfirmModal({ isOpen: true, actionType: 'leave', project: project, title: "Leave Project?", message: `Are you sure you want to request to leave "${project.name}"? The Admin must approve this action.` });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name) return showToast("Project Title is required!", "error");
    
    try {
      await updateProjectApi(editModal.project._id, editFormData);
      showToast("Project updated successfully!");
      setEditModal({ isOpen: false, project: null });
      fetchProjects(); 
    } catch (error) {
      showToast("Error updating project.", "error");
    }
  };

  const executeConfirmAction = async () => {
    const { actionType, project } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false }); 

    if (actionType === 'delete') {
      try {
        await deleteProjectApi(project._id); 
        setProjects(prev => prev.filter(p => p._id !== project._id));
        showToast("Project deleted successfully!"); 
      } catch (error) {
        showToast(error.response?.data?.message || "Error deleting project."); 
      }
    } else if (actionType === 'leave') {
      try {
        const res = await leaveProjectApi(project._id);
        showToast(res.data?.message || "Leave request sent successfully."); 
      } catch (error) {
        showToast(error.response?.data?.message || "Error sending leave request."); 
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
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col relative">
      <Header />

      {toast && (
        <div className="fixed top-20 right-8 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center">
          <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {toast}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* HEADER SECTION */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
             <div>
              <h1 className="text-2xl font-bold text-[#1B2559] tracking-tight">Projects</h1>
              
              <div className="flex bg-slate-200/60 p-1 rounded-lg mt-4 w-fit border border-slate-200/50">
                <button onClick={() => setActiveTab('my-projects')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'my-projects' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>My Projects</button>
                <button onClick={() => setActiveTab('discover')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'discover' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Discover All</button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm transition" />
              </div>
              
              {isLeader && (
                <button onClick={() => navigate('/admin/projects/create')} className="bg-[#0b57d0] text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm font-bold text-sm flex items-center whitespace-nowrap transition active:scale-95">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Create project
                </button>
              )}
            </div>
          </div>

          {/* PROJECT LIST */}
          {isLoading ? (
             <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : currentProjects.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg></div>
               <h3 className="text-lg font-bold text-slate-800">No projects found</h3>
               <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentProjects.map((p) => (
                <ProjectCard key={p._id} project={p} activeTab={activeTab} currentUserId={currentUserId} isLeader={isLeader} onJoin={() => handleJoin(p._id)} onAction={(actionType) => handleActionClick(p, actionType)} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-1">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-2 rounded-lg transition ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition ${currentPage === pageNum ? 'bg-[#0b57d0] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{pageNum}</button>);
              })}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KHÔNG ĐỔI */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up p-6 text-center border border-slate-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${confirmModal.actionType === 'delete' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
              {confirmModal.actionType === 'delete' ? (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>) : (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>)}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 px-2">{confirmModal.message}</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition w-full">Cancel</button>
              <button onClick={executeConfirmAction} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition w-full active:scale-95 ${confirmModal.actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>{confirmModal.actionType === 'delete' ? 'Delete Project' : 'Request to Leave'}</button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#1B2559] flex items-center"><svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>Edit Project</h3>
              <button onClick={() => setEditModal({ isOpen: false, project: null })} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Project Title</label><input type="text" required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold text-slate-800" /></div>
                  <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Project Type</label><select value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 cursor-pointer"><option value="">-- Select Type --</option><option value="Software Development">Software Development</option><option value="Marketing Campaign">Marketing Campaign</option><option value="Internal Operations">Internal Operations</option></select></div>
                </div>
                <div className="space-y-4">
                  <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Start Date</label><input type="date" value={editFormData.startDate} onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-700" /></div>
                  <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">End Date</label><input type="date" value={editFormData.endDate} onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold text-slate-700" /></div>
                </div>
              </div>
              <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Description</label><textarea rows="3" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium text-slate-700 resize-none"></textarea></div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditModal({ isOpen: false, project: null })} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0b57d0] text-white hover:bg-blue-700 shadow-sm transition active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}