// fe/src/pages/ProjectDetail.jsx
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { getProjectByIdApi, updateProjectApi, uploadProjectResourceApi, removeMemberFromProjectApi } from "../api/projectApi";
import { getTasksByProjectApi, createTaskApi, deleteTaskApi, updateTaskApi } from "../api/taskApi"; 
import { io } from "socket.io-client";

export default function ProjectDetail() {

  const api = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("kanban"); 

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState(""); 
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const [kickConfirm, setKickConfirm] = useState({ show: false, userId: null, userName: "" });
  
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const isLeader = user?.role?.toLowerCase() === "admin" || project?.owner === user?._id || project?.owner?._id === user?._id;
  const [showTeamModal, setShowTeamModal] = useState(false); 

  // ==== THÊM HỆ THỐNG TOAST MESSAGE XỊN XÒ ====
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initiateKickMember = (userId, userName) => {
    setKickConfirm({ show: true, userId, userName });
  };

  // 2. Hàm này là LÚC BẤM NÚT XÁC NHẬN trong Popup
  const executeKickMember = async () => {
    const { userId, userName } = kickConfirm;
    if (!userId) return;

    try {
      await removeMemberFromProjectApi(id, userId);
      // Xóa ngay avatar trên UI
      setProject(prev => ({
        ...prev,
        members: prev.members.filter(m => m._id !== userId)
      }));
      showToast(`Successfully removed ${userName}!`);
    } catch (error) {
      showToast(error.response?.data?.message || "Error removing members", "error");
    } finally {
      // Đóng Popup sau khi xử lý xong (dù lỗi hay thành công)
      setKickConfirm({ show: false, userId: null, userName: "" });
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        getProjectByIdApi(id),
        getTasksByProjectApi(id)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Error fetching project details", error);
      showToast("Không thể tải dữ liệu dự án.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = io(`${api}`); 

    socket.on("connect", () => {
      socket.emit("join_project_room", id); 
    });

    socket.on("task_updated", () => {
      fetchData(); 
    });

    socket.on("project_updated", () => {
      fetchData(); 
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); 
  };

  const getDownloadUrl = (url, type) => {
    if (!url) return "#";
    if (type === 'image') return url; 
    if (url.includes('/image/upload/')) return url.replace('/image/upload/', '/image/upload/fl_attachment/');
    if (url.includes('/raw/upload/')) return url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    return url;
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return "";
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days === 0 ? "today" : `${days} days ago`;
  };

  const isProjectCompleted = project?.status === 'Completed' || project?.status === 'completed';

  const autoStartProjectIfNeeded = async (newTaskStatus) => {
    if (!isLeader) return;
    const currentStatus = project?.status?.toLowerCase();
    if (currentStatus === 'planning' && ['In Progress', 'In Review', 'Done'].includes(newTaskStatus)) {
      try {
        await updateProjectApi(project._id, { status: 'In Progress' });
        setProject(prev => ({ ...prev, status: 'In Progress' }));
        showToast("Dự án đã tự động chuyển sang In Progress!");
      } catch (error) {
        console.error("Failed to auto-update project status", error);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const payload = {
      title: newTaskTitle,
      projectId: id,
      status: 'To Do', 
      priority: newTaskPriority, 
      startDate: new Date(), 
    };

    if (newTaskAssignee) payload.assignee = newTaskAssignee;

    try {
      await createTaskApi(payload);
      setNewTaskTitle("");
      setNewTaskPriority("medium"); 
      setNewTaskAssignee(""); 
      setShowTaskModal(false);
      fetchData(); 
      showToast("Tạo nhiệm vụ thành công!");
    } catch (error) {
      console.error("Error creating task:", error);
      showToast("Lỗi khi tạo nhiệm vụ.", "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTaskApi([taskId]); 
      fetchData(); 
      showToast("Task deleted successful!");
    } catch (error) {
       console.error("Error deleting task:", error);
       showToast("Error deleting task.", "error");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const updatePayload = { status: newStatus };
    if (newStatus === 'Done') updatePayload.endDate = new Date();
    else updatePayload.endDate = null; 

    try {
      await updateTaskApi(taskId, updatePayload);
      await autoStartProjectIfNeeded(newStatus); 
      fetchData(); 
    } catch (error) { showToast("Error updating status", "error"); }
  };

  const handleSaveEdit = async (taskId) => {
      try {
         await updateTaskApi(taskId, { title: editTitleValue });
         setEditingTaskId(null);
         fetchData();
         showToast("Saved!");
      } catch (error) { showToast("Lỗi khi đổi tên.", "error"); }
  };

  const handleStatusSelect = (newStatus) => {
    setIsStatusMenuOpen(false);
    if (newStatus === project.status || (newStatus === 'Completed' && isProjectCompleted)) return;

    if (newStatus === 'Completed') {
      const hasIncompleteTasks = tasks.some(t => t.status !== 'Done');
      if (hasIncompleteTasks) {
        showToast("All tasks need to be done before complete!", "error");
        return;
      }
      setShowCompleteConfirm(true);
    } else {
      executeStatusUpdate(newStatus);
    }
  };

  const executeStatusUpdate = async (newStatus) => {
    try {
      await updateProjectApi(project._id, { status: newStatus });
      setProject({ ...project, status: newStatus });
      setShowCompleteConfirm(false);
      showToast(`Update status to ${newStatus}`);
    } catch (error) { showToast("Lỗi cập nhật trạng thái dự án.", "error"); }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData("taskId");
    if (!draggedTaskId) return;

    const taskToUpdate = tasks.find(t => t._id === draggedTaskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const updatePayload = { status: newStatus };
    if (newStatus === 'Done' && taskToUpdate.status !== 'Done') updatePayload.endDate = new Date();
    else if (newStatus !== 'Done' && taskToUpdate.status === 'Done') updatePayload.endDate = null;

    setTasks(prevTasks => prevTasks.map(task => task._id === draggedTaskId ? { ...task, ...updatePayload } : task));

    try {
      await updateTaskApi(draggedTaskId, updatePayload);
      await autoStartProjectIfNeeded(newStatus);
      fetchData(); 
    } catch (error) {
      showToast("Lỗi khi kéo thả.", "error");
      fetchData();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("Too large!(<10mb)", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploadingFile(true);
      const res = await uploadProjectResourceApi(project._id, formData);
      setProject(prev => ({
        ...prev,
        resources: [...(prev.resources || []), res.data.resource]
      }));
      showToast("Upload documents successful");
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi tải file lên.", "error");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const calculateTotalTimeSpent = () => {
    let totalSeconds = 0;
    tasks.forEach(task => {
      if (task.status === 'Done' && task.startDate && task.endDate) {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
        if (diffInSeconds > 0) totalSeconds += diffInSeconds;
      }
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTaskTimeSpent = (task) => {
      if (task.status === 'Done' && task.startDate && task.endDate) {
          const start = new Date(task.startDate);
          const end = new Date(task.endDate);
          const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
          if (diffInSeconds > 0) {
              const h = Math.floor(diffInSeconds / 3600).toString().padStart(2, '0');
              const m = Math.floor((diffInSeconds % 3600) / 60).toString().padStart(2, '0');
              return `${h}:${m}`;
          }
      }
      return "00:00"; 
  };

  const renderListView = () => (
      <div className="space-y-3">
        {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              </div>
              <p className="font-bold text-lg text-slate-700">No tasks yet</p>
              <p className="text-sm text-slate-500 mt-1">Get started by creating a new task.</p>
            </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className={`flex items-center justify-between p-4 bg-white rounded-xl border ${task.status === 'Done' ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-300'} shadow-sm transition duration-200 group`}>
              
              <div className="flex items-center space-x-4 w-[45%]">
                  <input 
                    type="checkbox"
                    checked={task.status === 'Done'}
                    onChange={() => handleStatusChange(task._id, task.status === 'Done' ? 'To Do' : 'Done')}
                    className="w-5 h-5 rounded border-slate-300 text-[#0b57d0] focus:ring-[#0b57d0] cursor-pointer"
                  />
                <div className="flex-shrink-0">
                  <svg className={`w-5 h-5 ${task.status === 'Done' ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="flex flex-col flex-1 truncate">
                  {editingTaskId === task._id ? (
                    <div className="flex items-center space-x-2">
                        <input autoFocus type="text" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} className="border border-blue-300 rounded px-3 py-1 text-sm flex-1 outline-none focus:ring-1 focus:ring-blue-500" />
                        <button onClick={() => handleSaveEdit(task._id)} className="text-[#0b57d0] text-xs font-bold hover:underline">Save</button>
                        <button onClick={() => setEditingTaskId(null)} className="text-slate-400 text-xs font-bold hover:underline">Cancel</button>
                    </div>
                  ) : (
                      <h4 className={`font-bold text-[15px] truncate ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-[#0b57d0]'} transition`}>
                        {task.title}
                      </h4>
                  )}
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1.5 font-medium">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-slate-600">#{task._id.slice(-5)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-50 text-red-600' : task.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>{task.priority}</span>
                    <span>Opened {getDaysAgo(task.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-12 text-sm w-[35%]">
                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status</div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${task.status === 'To Do' ? 'bg-slate-50 text-slate-600 border-slate-200' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : task.status === 'In Review' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {task.status}
                  </span>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Due Date</div>
                  <div className="flex items-center font-bold text-slate-700">
                    <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {formatDate(task.endDate)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 w-[20%] justify-end">
                <div className={`flex items-center px-3 py-1 rounded-lg text-xs font-bold ${task.status === 'Done' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {formatTaskTimeSpent(task)}
                </div>
                <img className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm" src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.fullName || 'Unassigned'}`} alt="Assignee" title={task.assignee?.fullName || "Unassigned"} />
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingTaskId(task._id); setEditTitleValue(task.title); }} className="p-1.5 text-slate-400 hover:text-[#0b57d0] hover:bg-blue-50 rounded-md transition" title="Edit Task">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition" title="Delete Task">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
  );

  const renderKanbanView = () => {
    const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

    return (
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {columns.map(col => {
          const columnTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col} className="w-[320px] min-w-[320px] flex-shrink-0 bg-slate-100/70 rounded-2xl p-4 flex flex-col h-full border border-slate-200/50" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col)}>
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-700 text-[13px] uppercase tracking-wider flex items-center">
                  {col}
                  <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{columnTasks.length}</span>
                </h3>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2">
                {columnTasks.map(task => (
                  <div key={task._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition cursor-grab active:cursor-grabbing group" draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}>
                    
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === "high" ? "bg-red-50 text-red-600" : task.priority === "medium" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>{task.priority}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteTask(task._id)} className="text-slate-400 hover:text-red-500 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                      </div>
                    </div>
                    
                    <p className="font-bold text-slate-800 text-sm mb-4 leading-relaxed">{task.title}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-400">#{task._id.slice(-5).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                         <div className={`flex items-center text-[10px] font-bold ${task.status === 'Done' ? 'text-slate-400' : 'text-slate-500'}`}>
                           <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           {formatTaskTimeSpent(task)}
                         </div>
                         <img className="h-7 w-7 rounded-full object-cover border-2 border-white shadow-sm" src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.fullName || "Unassigned"}`} alt="Assignee" title={task.assignee?.fullName || "Unassigned"} />
                      </div>
                    </div>
                  </div>
                ))}
                
                {col === "To Do" && !isProjectCompleted && (
                  <button onClick={() => setShowTaskModal(true)} className="flex items-center justify-center py-3 mt-2 border border-slate-300 border-dashed rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-700 hover:border-slate-400 transition bg-slate-50/50">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-sm font-bold">Create issue</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResourcesView = () => {
    const resources = project.resources || [];
    
    return (
      <div className="h-full flex flex-col">
        {isLeader && !isProjectCompleted && (
          <div className="mb-6 flex justify-end">
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               className="hidden" 
               accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploadingFile}
               className={`bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-700 transition flex items-center ${isUploadingFile ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
             >
               {isUploadingFile ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Uploading...
                 </>
               ) : (
                 <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Upload File
                 </>
               )}
             </button>
          </div>
        )}

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p className="font-bold text-lg text-slate-700">No resources found</p>
            <p className="text-sm text-slate-500 mt-1">Upload project documents, assets, and files here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((file, idx) => (
              <a 
                key={idx} 
                href={getDownloadUrl(file.url, file.type)} 
                target="_blank" 
                rel="noopener noreferrer"
                download 
                className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col h-48"
              >
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl mb-4 group-hover:bg-blue-50/50 transition">
                  {file.type === 'image' ? (
                     <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  ) : (
                     <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 truncate" title={file.name}>{file.name}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-medium">
                    <span>{formatDate(file.uploadedAt)}</span>
                    <span className="uppercase tracking-wider font-bold text-slate-500">{file.type}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="h-screen flex flex-col bg-slate-50"><Header /><div className="flex flex-1"><Sidebar /><div className="flex-1 flex items-center justify-center text-slate-500 font-medium">Loading project details...</div></div></div>;
  if (!project) return <div className="p-10 text-center text-red-500 font-medium">Project not found.</div>;

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex flex-col relative">
      <Header />

      {/* TOAST HIỂN THỊ LỖI Ở ĐÂY */}
      {toast && (
        <div className={`fixed top-20 right-8 px-6 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 lg:p-8 flex flex-col overflow-hidden">
          
          <div className="mb-6 bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 shrink-0">
             <div className="text-slate-400 text-sm mb-4 font-bold flex items-center space-x-2">
              <Link to="/projects" className="hover:text-[#0b57d0] transition">Projects</Link> 
              <span>/</span> 
              <span className="text-slate-700">{project.name}</span>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1B2559] tracking-tight">{project.name}</h1>
                <div className="flex items-center mt-4">
                  
                  <div 
                    className="flex -space-x-2 overflow-hidden items-center mr-6 cursor-pointer hover:opacity-80 transition"
                    onClick={() => isLeader && setShowTeamModal(true)}
                    title={isLeader ? "Manage Team (Bấm để quản lý)" : "Team Members"}
                  >
                    {project.members?.slice(0, 4).map((member, idx) => (
                      <img key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm" src={member.avatar || `https://ui-avatars.com/api/?name=${member.fullName}`} alt="Avatar" title={member.fullName}/>
                    ))}
                    {project.members?.length > 4 && (
                       <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 text-[10px] font-bold shadow-sm">
                          +{project.members.length - 4}
                       </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => !isProjectCompleted && setIsStatusMenuOpen(!isStatusMenuOpen)}
                      disabled={isProjectCompleted}
                      className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
                        isProjectCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed'
                          : project.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: isProjectCompleted ? '#10b981' : project.status === 'In Progress' ? '#3b82f6' : '#64748b' }}></span>
                      <span>{project.status || 'Planning'}</span>
                      {!isProjectCompleted && (
                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      )}
                    </button>

                    {isStatusMenuOpen && (
                      <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden z-20 animate-fade-in-up">
                        <button onClick={() => handleStatusSelect('Planning')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">Planning</button>
                        <button onClick={() => handleStatusSelect('In Progress')} className="w-full text-left px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 border-b border-slate-100">In Progress</button>
                        <button onClick={() => handleStatusSelect('Completed')} className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50">Completed</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-6">
                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Time logged</div>
                  <div className="flex items-center space-x-2 text-slate-700 font-bold">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{calculateTotalTimeSpent()}</span>
                  </div>
                </div>
                <div className="w-px bg-slate-200 h-10"></div>
                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Due date</div>
                  <div className="flex items-center space-x-2 text-slate-700 font-bold">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{formatDate(project.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-0 overflow-hidden">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0 border-b border-slate-100 pb-4">
              
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setViewMode('kanban')} 
                  className={`pb-2 transition text-sm font-bold border-b-2 ${viewMode === 'kanban' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                    Kanban Board
                  </div>
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`pb-2 transition text-sm font-bold border-b-2 ${viewMode === 'list' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    List View
                  </div>
                </button>
                <button 
                  onClick={() => setViewMode('resources')} 
                  className={`pb-2 transition text-sm font-bold border-b-2 ${viewMode === 'resources' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Resources
                  </div>
                </button>
              </div>

              {viewMode !== 'resources' && !isProjectCompleted && (
                <button onClick={() => setShowTaskModal(true)} className="bg-[#0b57d0] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center active:scale-95">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Create issue
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto rounded-xl">
                {viewMode === 'list' && renderListView()}
                {viewMode === 'kanban' && renderKanbanView()}
                {viewMode === 'resources' && renderResourcesView()}
            </div>
            
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in-up">
             <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-[#1B2559] flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  Create New Issue
                </h3>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             <form onSubmit={handleCreateTask} className="p-6">
                <div className="mb-5">
                   <label className="block text-sm font-bold text-slate-700 mb-2">Summary</label>
                   <input 
                     autoFocus type="text" placeholder="What needs to be done?" required
                     value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-medium text-slate-800"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-5 mb-8">
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                       <select 
                         value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-bold text-sm text-slate-700 cursor-pointer"
                       >
                           <option value="low">Low</option>
                           <option value="medium">Medium</option>
                           <option value="high">High</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Assignee</label>
                       <select 
                         value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-bold text-sm text-slate-700 cursor-pointer"
                       >
                           <option value="">Unassigned</option>
                           {project?.members?.map(member => (
                             <option key={member._id} value={member._id}>{member.fullName}</option>
                           ))}
                       </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                   <button type="button" onClick={() => setShowTaskModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                   <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0b57d0] text-white hover:bg-blue-700 shadow-sm transition active:scale-95">Create Issue</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Complete Project?</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You are about to mark <strong>{project.name}</strong> as completed. This will lock all tasks and status updates.
            </p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setShowCompleteConfirm(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition w-full">Cancel</button>
              <button onClick={() => executeStatusUpdate('Completed')} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition w-full">Complete</button>
            </div>
          </div>
        </div>
      )}

      {showTeamModal && isLeader && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-[#1B2559] flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Manage Team
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {project.members?.map(member => {
                const isProjectOwner = project.owner === member._id || project.owner?._id === member._id;

                return (
                  <div key={member._id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition">
                    <div className="flex items-center space-x-3">
                      <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.fullName}`} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="avatar" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.fullName}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isProjectOwner ? "Project Owner" : "Member"}</p>
                      </div>
                    </div>
                    
      
                    {!isProjectOwner && member._id !== user._id && (
                      <button 
                        onClick={() => initiateKickMember(member._id, member.fullName)} // ĐỔI TÊN HÀM Ở ĐÂY
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==== POPUP XÁC NHẬN ĐUỔI NGƯỜI (CENTER MÀN HÌNH) ==== */}
      {kickConfirm.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/50 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl animate-fade-in-up p-6 max-w-sm w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận đuổi?</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Remove <strong>{kickConfirm.userName}</strong> from project? All <strong>{kickConfirm.userName}</strong> tasks will be removed!
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => setKickConfirm({ show: false, userId: null, userName: "" })} 
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition w-full"
              >
                Cancel
              </button>
              <button 
                onClick={executeKickMember} 
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition w-full active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}