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
  
  // Tabs: 'my-projects' hoặc 'discover'
  const [activeTab, setActiveTab] = useState('my-projects'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Lấy ID user hiện tại để phân quyền Xóa / Rời dự án
  // Giả sử bạn lưu thông tin user trong localStorage khi login, hoặc lấy từ Context/Redux
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

  // --- ACTIONS ---
  const handleJoin = async (projectId) => {
    try {
      await joinProjectApi(projectId);
      alert("Tham gia dự án thành công!");
      setActiveTab('my-projects'); // Chuyển về tab của tôi
    } catch (error) {
      console.error(error);
      alert("Không thể tham gia dự án.");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dự án này vĩnh viễn?")) return;
    try {
      await deleteProjectApi(projectId);
      fetchProjects();
    } catch (error) {
      alert("Lỗi khi xóa dự án. Bạn có phải là chủ dự án không?");
    }
  };

  const handleLeave = async (projectId) => {
    if (!window.confirm("Bạn có chắc chắn muốn rời khỏi dự án này?")) return;
    try {
      await leaveProjectApi(projectId);
      fetchProjects();
    } catch (error) {
      alert("Lỗi khi rời dự án.");
    }
  };

  // --- Lọc và Phân trang ---
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
              
              {/* Tabs Navigation */}
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
                  onDelete={() => handleDelete(p._id)}
                  onLeave={() => handleLeave(p._id)}
                />
              ))}
            </div>
          )}

          {/* Giao diện Phân trang (Pagination) */}
{totalPages > 1 && (
  <div className="flex justify-center items-center mt-10 space-x-2 text-sm text-gray-500">
    {/* Nút Previous */}
    <button 
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded-md transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-black hover:bg-gray-100 cursor-pointer'}`}
    >
      Previous
    </button>

    {/* Các số trang (1, 2, 3...) */}
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

    {/* Nút Next */}
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