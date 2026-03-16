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
  const itemsPerPage = 6;

  const navigate = useNavigate();

  // Lấy thông tin user hiện tại
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id; 
  
  // Xác định quyền Leader/Admin
  const isLeader = user.role === "Leader" || user.role === "Admin";

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

  // Xử lý xin tham gia dự án (Send Join Request)
  const handleJoin = async (projectId) => {
    try {
      // TẠM THỜI vẫn gọi API join cũ, nhưng ta đổi thông báo UI.
      // Sắp tới Backend sẽ cần đổi API này thành "createJoinRequest"
      await joinProjectApi(projectId);
      alert("Join request sent to the Admin! Please wait for approval.");
      // Tạm thời ẩn reload để người dùng biết là đang chờ duyệt
      // setActiveTab('my-projects'); 
    } catch (error) {
      console.error(error);
      alert("Failed to send join request.");
    }
  };

  // Xử lý xin rời / xóa dự án
  const handleAction = async (project) => {
    const ownerId = project.owner?._id || project.owner;
    const isOwner = String(ownerId) === String(currentUserId);

    if (isOwner) {
      // Dành cho Admin/Owner: Có quyền xóa luôn
      const confirmMessage = "You are the owner of this project. If you leave, the entire project will be permanently deleted. Are you sure you want to proceed?";
      if (!window.confirm(confirmMessage)) return;
      
      try {
        await deleteProjectApi(project._id); 
        setProjects(prev => prev.filter(p => p._id !== project._id));
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting project.");
      }
    } else {
      // Dành cho Member: Gửi yêu cầu xin rời dự án
      if (!window.confirm("Are you sure you want to request to leave this project? The Admin must approve this action.")) return;
      
      try {
        // TẠM THỜI vẫn gọi API leave cũ.
        // Sắp tới Backend cần đổi thành "createLeaveRequest"
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
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Projects Management</h1>
              <div className="flex space-x-6 mt-4 border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab('my-projects')}
                  className={`pb-2 text-sm font-semibold transition ${activeTab === 'my-projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  My Projects
                </button>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className={`pb-2 text-sm font-semibold transition ${activeTab === 'discover' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Discover
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm"
              />
              
              {/* CHỈ RENDER NÚT CREATE NẾU LÀ LEADER/ADMIN */}
              {isLeader && (
                <button 
                  onClick={() => navigate('/admin/projects/create')} 
                  className="bg-[#0b57d0] text-white px-6 py-2 rounded-lg hover:bg-blue-800 shadow-sm font-semibold text-sm whitespace-nowrap"
                >
                  Create project
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
             <div className="text-center py-12 text-slate-500">Loading projects...</div>
          ) : currentProjects.length === 0 ? (
             <div className="text-center py-12 text-slate-500">No projects found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((p) => (
                <ProjectCard 
                  key={p._id} 
                  project={p} 
                  activeTab={activeTab}
                  currentUserId={currentUserId}
                  onJoin={() => handleJoin(p._id)}
                  onAction={() => handleAction(p)} 
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-2 text-sm text-gray-500">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-black hover:bg-gray-100 cursor-pointer'}`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md transition ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-black hover:bg-gray-100 cursor-pointer'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}