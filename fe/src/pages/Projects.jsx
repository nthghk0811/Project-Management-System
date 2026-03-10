// fe/src/pages/Projects.jsx
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectCard from "../components/projects/ProjectCard";
import { getMyProjectsApi, getDiscoverProjectsApi, joinProjectApi, deleteProjectApi, leaveProjectApi } from "../api/projectApi";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('my-projects'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Lấy ID user - BẠN HÃY CHECK LẠI XEM "user" CÓ ĐÚNG KEY TRONG LOCALSTORAGE KHÔNG NHÉ
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id; 

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = activeTab === 'my-projects' 
        ? await getMyProjectsApi() 
        : await getDiscoverProjectsApi();
      setProjects(res.data);
    } catch (error) {
      console.error("Lỗi khi fetch projects", error);
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
      alert("Tham gia dự án thành công!");
      setActiveTab('my-projects');
    } catch (error) {
      console.error(error);
      alert("Không thể tham gia dự án.");
    }
  };

  // --- HÀM GỘP CHUNG XỬ LÝ LEAVE / DELETE ---
  const handleAction = async (project) => {
    const ownerId = project.owner?._id || project.owner;
    const isOwner = String(ownerId) === String(currentUserId);

    if (isOwner) {
      // Dành cho Owner
      const confirmMessage = "Bạn là người tạo dự án này. Nếu bạn rời đi, toàn bộ dự án sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?";
      if (!window.confirm(confirmMessage)) return;
      
      try {
        await deleteProjectApi(project._id); 
        setProjects(prev => prev.filter(p => p._id !== project._id));
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi xóa dự án.");
      }
    } else {
      // Dành cho Member
      if (!window.confirm("Bạn có chắc chắn muốn rời khỏi dự án này?")) return;
      
      try {
        await leaveProjectApi(project._id);
        setProjects(prev => prev.filter(p => p._id !== project._id));
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi rời dự án.");
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
            {/* ... Giữ nguyên phần Header, Search, Tabs ... */}
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
              <button onClick={() => setOpenModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm font-semibold text-sm whitespace-nowrap">
                + New Project
              </button>
            </div>
          </div>

          {isLoading ? (
             <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : currentProjects.length === 0 ? (
             <div className="text-center py-12 text-slate-500">Không tìm thấy dự án nào.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((p) => (
                <ProjectCard 
                  key={p._id} 
                  project={p} 
                  activeTab={activeTab}
                  currentUserId={currentUserId}
                  onJoin={() => handleJoin(p._id)}
                  // Gọi chung 1 hàm handleAction
                  onAction={() => handleAction(p)} 
                />
              ))}
            </div>
          )}

          {/* ... Giữ nguyên phần Phân trang ... */}
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
      <CreateProjectModal open={openModal} onClose={() => setOpenModal(false)} onCreated={fetchProjects} />
    </div>
  );
}