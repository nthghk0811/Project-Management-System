// fe/src/pages/admin/AdminCreateProject.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { createProjectApi } from "../../api/projectApi";

export default function AdminCreateProject() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "", // Frontend có thể truyền type, nhưng nếu Backend chưa có thì có thể gộp vào description
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Project Title is required!");

    try {
      setIsLoading(true);
      await createProjectApi(formData);
      alert("Dự án đã được tạo thành công!");
      navigate("/projects"); // Quay lại trang danh sách dự án
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo dự án.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center text-slate-500 font-medium text-lg">
            <Link to="/projects" className="hover:text-blue-600 transition">Projects</Link>
            <span className="mx-2">/</span>
            <span className="text-blue-600 font-bold">Create Project</span>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-5xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ROW 1: Title, Type, Dates */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm shadow-sm"
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                   {/* Giả lập trường Project Type theo ảnh 3 */}
                  <label className="block text-sm font-bold text-slate-700 mb-2">Project Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm shadow-sm"
                    placeholder="e.g. Internal, Client, Open Source..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* ROW 2: Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm resize-none shadow-sm"
                  placeholder="Describe the goals and scope of this project..."
                ></textarea>
              </div>

              {/* ROW 3: Project Roles (Mock UI based on Image 3) */}
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Project Roles (Team Assignment)</label>
                 <div className="w-full md:w-1/2 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Giả lập giao diện chọn Role như trong ảnh */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                       <select className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                          <option>Team Lead</option>
                          <option>Developer</option>
                          <option>Designer</option>
                       </select>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-2">
                       {/* Mock Users */}
                       {['Yash', 'Anima', 'John', 'Sarah'].map((member, idx) => (
                         <label key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                            <div className="flex items-center space-x-3">
                               <span className="text-sm font-semibold text-slate-700">{member}</span>
                               <span className="text-xs italic text-slate-400">Team lead</span>
                            </div>
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                         </label>
                       ))}
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 italic">*Tính năng phân việc lúc tạo dự án sẽ được hoàn thiện sau.</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0b57d0] hover:bg-blue-700 shadow-md transition disabled:opacity-70"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}