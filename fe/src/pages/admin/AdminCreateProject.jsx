// fe/src/pages/admin/AdminCreateProject.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { createProjectApi } from "../../api/projectApi";
import { getAllUsersApi } from "../../api/authApi"; // API mới tạo ở bước 1

export default function AdminCreateProject() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Danh sách user thật từ Database
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Lấy ID của chính Admin để loại ra khỏi danh sách chọn (vì Admin auto được join)
  const currentAdminId = JSON.parse(localStorage.getItem("user") || "{}")._id;

  const [formData, setFormData] = useState({
    name: "",
    type: "", 
    description: "",
    startDate: "",
    endDate: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsersApi();
      // Lọc bỏ chính người đang đăng nhập (Admin) ra khỏi list
      const otherUsers = res.data.filter(u => u._id !== currentAdminId);
      setUsers(otherUsers);
    } catch (error) {
      console.error("Lỗi lấy danh sách User:", error);
      showToast("Không thể tải danh sách thành viên.", "error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý Checkbox chọn Member
  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return showToast("Project Title is required!", "error");

    try {
      setIsLoading(true);
      // Gộp mảng selectedMembers vào payload gửi lên Backend
      const payload = { ...formData, members: selectedMembers };
      
      await createProjectApi(payload);
      
      showToast("Project created successfully!");
      // Chờ 1 giây để User kịp đọc Toast rồi mới chuyển trang
      setTimeout(() => {
        navigate("/projects"); 
      }, 1000);

    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Error creating project.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col relative">
      <Header />

      {/* ==== GLOBAL TOAST NOTIFICATION ==== */}
      {toast.show && (
        <div className={`fixed top-20 right-8 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>
          {toast.type === 'error' ? (
             <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
             <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center text-slate-500 font-bold text-sm uppercase tracking-wider">
            <Link to="/projects" className="hover:text-blue-600 transition">Projects</Link>
            <span className="mx-2">/</span>
            <span className="text-blue-600">Create Project</span>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 max-w-4xl mx-auto">
            
            <div className="mb-8 border-b border-slate-100 pb-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create New Project</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">Set up the foundations for your team's new initiative.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ROW 1: Title, Type, Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-2">Project Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm font-bold text-slate-800 shadow-sm"
                      placeholder="e.g. Website Redesign Q3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-2">Project Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm font-bold text-slate-700 shadow-sm cursor-pointer"
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Software Development">Software Development</option>
                      <option value="Marketing Campaign">Marketing Campaign</option>
                      <option value="Internal Operations">Internal Operations</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm shadow-sm cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm shadow-sm cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* ROW 2: Description */}
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-2">Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm font-medium text-slate-700 resize-none shadow-sm leading-relaxed"
                  placeholder="Describe the goals, scope, and deliverables of this project..."
                ></textarea>
              </div>

              {/* ROW 3: REAL Team Assignment */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <div className="mb-4 flex items-center justify-between">
                   <div>
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-800">Initial Team Assignment</label>
                      <p className="text-xs font-medium text-slate-500 mt-1">Select members to immediately grant them access to this project.</p>
                   </div>
                   <div className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                     {selectedMembers.length} Selected
                   </div>
                 </div>
                 
                 <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {users.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500 italic">No other users found in the system.</div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {users.map((member) => (
                          <label 
                            key={member._id} 
                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition border ${selectedMembers.includes(member._id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-transparent'}`}
                          >
                             <div className="flex items-center space-x-3">
                                <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.fullName}`} alt="ava" className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" />
                                <div>
                                  <span className={`text-sm font-bold block ${selectedMembers.includes(member._id) ? 'text-blue-800' : 'text-slate-700'}`}>{member.fullName}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{member.role}</span>
                                </div>
                             </div>
                             <input 
                               type="checkbox" 
                               checked={selectedMembers.includes(member._id)}
                               onChange={() => toggleMember(member._id)}
                               className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                             />
                          </label>
                        ))}
                      </div>
                    )}
                 </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#0b57d0] hover:bg-blue-700 shadow-md transition disabled:opacity-70 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Creating...
                    </>
                  ) : (
                    "Launch Project"
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}