// fe/src/pages/GlobalTasks.jsx
import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import TaskList from "../../components/tasks/TaskList";
import TaskKanban from "../../components/tasks/TaskKanban";
import TaskModal from "../../components/tasks/TaskModal";
// Giả sử bạn đã thêm hàm này vào taskApi.js
import { getGlobalTasksApi } from "../../api/taskApi"; 

export default function GlobalTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quản lý hiển thị
  const [viewMode, setViewMode] = useState("list"); // 'list' hoặc 'kanban'
  const [searchQuery, setSearchQuery] = useState("");

  const [filterPriority, setFilterPriority] = useState("all"); // Lọc theo độ ưu tiên
  const [filterStatus, setFilterStatus] = useState("all"); // Lọc theo trạng thái
  
  // Quản lý Modal Chi tiết
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGlobalTasks = async () => {
    try {
      setIsLoading(true);
      const res = await getGlobalTasksApi();
      setTasks(res.data);
    } catch (error) {
      console.error("Lỗi khi tải global tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    // 1. Kiểm tra Search (Tên task có chứa từ khóa không)
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Kiểm tra Priority (Nếu là "all" thì bỏ qua, nếu khác thì phải khớp)
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    
    // 3. Kiểm tra Status
    const matchStatus = filterStatus === "all" || t.status === filterStatus;

    // Phải thỏa mãn cả 3 điều kiện trên thì mới cho hiển thị
    return matchSearch && matchPriority && matchStatus;
  });

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
            
            <div className="flex items-center space-x-3">
              
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white shadow-sm"
                />
              <select 
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1.5 text-sm text-slate-600 focus:outline-none bg-transparent border-r border-slate-200 cursor-pointer hover:bg-slate-50 transition"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* 3. Lọc theo Status */}
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm text-slate-600 focus:outline-none bg-transparent cursor-pointer hover:bg-slate-50 transition rounded-r-lg"
                >
                  <option value="all">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>

              {/* View Switcher Dropdown (Giả lập đơn giản) */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex p-1">
                <button 
                  onClick={() => setViewMode("kanban")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${viewMode === "kanban" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Kanban View
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${viewMode === "list" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                >
                  List View
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <div className="text-center py-20 text-slate-500">Loading your tasks...</div>
          ) : viewMode === "list" ? (
            <TaskList tasks={filteredTasks} onOpenTask={openTaskDetail} onRefresh={fetchGlobalTasks} />
          ) : (
            <TaskKanban tasks={filteredTasks} onOpenTask={openTaskDetail} onRefresh={fetchGlobalTasks} />
          )}

        </div>
      </div>

      {/* Modal chi tiết Task (Ảnh 6) */}
      {isModalOpen && selectedTask && (
        <TaskModal 
          task={selectedTask} 
          allTasks={tasks}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }} 
          onRefresh={fetchGlobalTasks}
        />
      )}
    </div>
  );
}