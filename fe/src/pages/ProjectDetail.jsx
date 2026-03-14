// fe/src/pages/ProjectDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { getProjectByIdApi, updateProjectApi } from "../api/projectApi";
import { getTasksByProjectApi, createTaskApi, deleteTaskApi, updateTaskApi } from "../api/taskApi"; 

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "list"

  // Modal and Editing States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState(""); // <-- BỔ SUNG: State cho Assignee
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  
  // Dropdown and Complete Modal States
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); 
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return "";
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days === 0 ? "today" : `${days} days ago`;
  };

  const isProjectCompleted = project?.status === 'Completed' || project?.status === 'completed';

const autoStartProjectIfNeeded = async (newTaskStatus) => {
    // Đưa status hiện tại về chữ thường hết để so sánh cho "chắc cốp"
    const currentStatus = project?.status?.toLowerCase();
    
    if (currentStatus === 'planning' && ['In Progress', 'In Review', 'Done'].includes(newTaskStatus)) {
      try {
        await updateProjectApi(project._id, { status: 'In Progress' });
        setProject(prev => ({ ...prev, status: 'In Progress' }));
      } catch (error) {
        console.error("Failed to auto-update project status", error);
      }
    }
  };

  // --- ACTIONS ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Chuẩn bị dữ liệu gửi lên Backend
    const payload = {
      title: newTaskTitle,
      projectId: id,
      status: 'To Do', 
      priority: newTaskPriority, 
      startDate: new Date(), 
    };

    // Nếu có chọn người làm thì mới gửi assignee lên
    if (newTaskAssignee) {
      payload.assignee = newTaskAssignee;
    }

    try {
      await createTaskApi(payload);
      
      // Reset form
      setNewTaskTitle("");
      setNewTaskPriority("medium"); 
      setNewTaskAssignee(""); // Reset Assignee
      setShowTaskModal(false);
      fetchData(); 
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTaskApi([taskId]); 
      fetchData(); 
    } catch (error) {
       console.error("Error deleting task:", error);
       alert("Failed to delete task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const updatePayload = { status: newStatus };
    if (newStatus === 'Done') {
        updatePayload.endDate = new Date();
    } else {
        updatePayload.endDate = null; 
    }

    try {
      await updateTaskApi(taskId, updatePayload);
      await autoStartProjectIfNeeded(newStatus); 
      fetchData(); 
    } catch (error) {
       console.error("Error updating status", error);
    }
  };

  const handleSaveEdit = async (taskId) => {
      try {
         await updateTaskApi(taskId, { title: editTitleValue });
         setEditingTaskId(null);
         fetchData();
      } catch (error) {
         console.error("Error updating task title", error);
      }
  };

  const handleStatusSelect = (newStatus) => {
    setIsStatusMenuOpen(false);
    if (newStatus === project.status || (newStatus === 'Completed' && isProjectCompleted)) return;

    if (newStatus === 'Completed') {
      const hasIncompleteTasks = tasks.some(t => t.status !== 'Done');
      if (hasIncompleteTasks) {
        alert("⚠️ Cannot complete project!\nAll tasks must be moved to 'Done' before the project can be marked as complete.");
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
    } catch (error) {
      alert("Failed to update project status.");
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData("taskId");
    if (!draggedTaskId) return;

    const taskToUpdate = tasks.find(t => t._id === draggedTaskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const updatePayload = { status: newStatus };
    if (newStatus === 'Done' && taskToUpdate.status !== 'Done') {
        updatePayload.endDate = new Date();
    } else if (newStatus !== 'Done' && taskToUpdate.status === 'Done') {
        updatePayload.endDate = null;
    }

    setTasks(prevTasks => 
      prevTasks.map(task => task._id === draggedTaskId ? { ...task, ...updatePayload } : task)
    );

    try {
      await updateTaskApi(draggedTaskId, updatePayload);
      await autoStartProjectIfNeeded(newStatus);
      fetchData(); 
    } catch (error) {
      console.error("Error updating status on drop", error);
      fetchData();
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
    const seconds = totalSeconds % 60;
    return `${hours}h : ${minutes}m : ${seconds}s`;
  };

  const formatTaskTimeSpent = (task) => {
      if (task.status === 'Done' && task.startDate && task.endDate) {
          const start = new Date(task.startDate);
          const end = new Date(task.endDate);
          const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
          if (diffInSeconds > 0) {
              const h = Math.floor(diffInSeconds / 3600).toString().padStart(2, '0');
              const m = Math.floor((diffInSeconds % 3600) / 60).toString().padStart(2, '0');
              const s = (diffInSeconds % 60).toString().padStart(2, '0');
              return `${h}:${m}:${s}`;
          }
      }
      return "00:00:00"; 
  };

  const renderListView = () => (
      <div className="space-y-4">
        {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              <p className="font-medium text-lg text-slate-500">No tasks yet</p>
              <p className="text-sm mt-1">Get started by creating a new task.</p>
            </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className={`flex items-center justify-between p-4 bg-white rounded-xl border ${task.status === 'Done' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'} shadow-sm hover:shadow-md transition duration-200 group`}>
              <div className="flex items-center space-x-4 w-1/2">
                  <input 
                    type="checkbox"
                    checked={task.status === 'Done'}
                    onChange={() => handleStatusChange(task._id, task.status === 'Done' ? 'To Do' : 'Done')}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                <div className="flex-shrink-0 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </div>
                <div className="flex flex-col flex-1">
                  {editingTaskId === task._id ? (
                    <div className="flex items-center space-x-2">
                        <input autoFocus type="text" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} className="border border-blue-300 rounded px-2 py-1 text-sm flex-1 outline-none focus:ring-1 focus:ring-blue-500" />
                        <button onClick={() => handleSaveEdit(task._id)} className="text-emerald-600 text-xs font-bold hover:underline">Save</button>
                        <button onClick={() => setEditingTaskId(null)} className="text-slate-400 text-xs font-bold hover:underline">Cancel</button>
                    </div>
                  ) : (
                      <h4 className={`font-bold text-[15px] truncate max-w-md ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-800'} transition`}>
                        {task.title}
                      </h4>
                  )}
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-medium">
                    <span>#{task._id.slice(-6)}</span>
                    <span>Opened {getDaysAgo(task.createdAt)} by <strong className="text-slate-700">{task.creator?.fullName || 'Unknown'}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${task.status === 'To Do' ? 'bg-slate-100 text-slate-600' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : task.status === 'In Review' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'}`}>{task.status}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${task.priority === 'high' ? 'bg-red-50 text-red-600' : task.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{task.priority}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-8 text-sm">
                <div>
                  <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">Start Date</div>
                  <div className="flex items-center font-bold text-slate-700">
                    <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {formatDate(task.startDate)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">Due Date</div>
                  <div className="flex items-center font-bold text-slate-700">
                    <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {formatDate(task.endDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-5">
                <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${task.status === 'Done' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {formatTaskTimeSpent(task)}
                </div>
                <img className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm" src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.fullName || 'Unassigned'}`} alt="Assignee" title={task.assignee?.fullName || "Unassigned"} />
                <button onClick={() => { setEditingTaskId(task._id); setEditTitleValue(task.title); }} className="text-slate-400 hover:text-blue-500 transition" title="Edit Task">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onClick={() => handleDeleteTask(task._id)} className="text-slate-400 hover:text-red-500 transition" title="Delete Task">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
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
            <div key={col} className="w-[300px] min-w-[300px] flex-shrink-0 bg-slate-100 rounded-xl p-3 flex flex-col h-full" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col)}>
              <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="font-bold text-slate-700 text-sm uppercase">
                  {col}
                  <span className="ml-1 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{columnTasks.length}</span>
                </h3>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto">
                {columnTasks.map(task => (
                  <div key={task._id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition cursor-grab active:cursor-grabbing" draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}>
                    <p className="font-semibold text-slate-800 text-sm mb-2">{task.title}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.priority === "high" ? "bg-red-50 text-red-600" : task.priority === "medium" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>{task.priority}</span>
                      <span className="text-xs text-slate-500 font-medium">#{task._id.slice(-5)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={task.status === "Done"} onChange={() => handleStatusChange(task._id, task.status === "Done" ? "To Do" : "Done")} className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer" />
                      </div>
                      <img className="h-6 w-6 rounded-full object-cover border border-slate-200" src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.fullName || "Unassigned"}`} alt="Assignee" title={task.assignee?.fullName || "Unassigned"} />
                    </div>
                  </div>
                ))}
                
                {col === "To Do" && !isProjectCompleted && (
                  <button onClick={() => setShowTaskModal(true)} className="flex items-center justify-center py-2 mt-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-sm font-semibold">Create Task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500 font-medium">Loading project details...</div>;
  if (!project) return <div className="p-10 text-center text-red-500 font-medium">Project not found.</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-8 overflow-y-auto">
          
          <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="text-slate-400 text-sm mb-4 font-medium flex items-center space-x-2">
              <Link to="/projects" className="hover:text-slate-700 transition">Projects</Link> 
              <span>/</span> 
              <span className="text-slate-700">{project.name}</span>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{project.name}</h1>
                <div className="flex -space-x-2 overflow-hidden items-center ml-2">
                  {project.members?.slice(0, 3).map((member, idx) => (
                    <img key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={member.avatar || `https://ui-avatars.com/api/?name=${member.fullName}`} alt="Avatar" title={member.fullName}/>
                  ))}
                  {project.members?.length > 3 && (
                     <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-red-100 text-red-500 text-xs font-bold">
                        +{project.members.length - 3}
                     </div>
                  )}
                </div>
                
                {/* STATUS DROPDOWN JIRA-STYLE */}
                <div className="relative ml-4">
                  <button
                    onClick={() => !isProjectCompleted && setIsStatusMenuOpen(!isStatusMenuOpen)}
                    disabled={isProjectCompleted}
                    className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${
                      isProjectCompleted
                        ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                        : project.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    <span>{project.status || 'Planning'}</span>
                    {!isProjectCompleted && (
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                  </button>

                  {isStatusMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 w-36 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-20 animate-fade-in-up">
                      <button onClick={() => handleStatusSelect('Planning')} className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 border-b border-slate-100">Planning</button>
                      <button onClick={() => handleStatusSelect('In Progress')} className="w-full text-left px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 border-b border-slate-100">In Progress</button>
                      <button onClick={() => handleStatusSelect('Completed')} className="w-full text-left px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Completed</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-6">
                <div>
                  <div className="text-slate-500 text-xs mb-1 text-center font-semibold uppercase">Time logged</div>
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-bold border border-emerald-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{calculateTotalTimeSpent()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1 text-center font-semibold uppercase">Due date</div>
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-bold border border-emerald-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{formatDate(project.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Tasks</h2>
              
              <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
                      <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`} title="Kanban View">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                      </button>
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`} title="List View">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                      </button>
                  </div>

                  {!isProjectCompleted && (
                    <button onClick={() => setShowTaskModal(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition shadow-sm">
                      + Create Task
                    </button>
                  )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {viewMode === 'list' ? renderListView() : renderKanbanView()}
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium space-x-6">
              <span className="flex items-center"><svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> {tasks.length} tasks</span>
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
             <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Create Task</h3>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             <form onSubmit={handleCreateTask} className="p-6">
                <div className="mb-4">
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Task Summary</label>
                   <input 
                     autoFocus
                     type="text" 
                     placeholder="e.g., Design the homepage UI"
                     className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                     value={newTaskTitle}
                     onChange={(e) => setNewTaskTitle(e.target.value)}
                     required
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                       <select 
                         className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                         value={newTaskPriority}
                         onChange={(e) => setNewTaskPriority(e.target.value)}
                       >
                           <option value="low">Low</option>
                           <option value="medium">Medium</option>
                           <option value="high">High</option>
                       </select>
                    </div>
                    <div>
                       {/* TRƯỜNG ASSIGNEE MỚI THÊM VÀO ĐÂY */}
                       <label className="block text-sm font-semibold text-slate-700 mb-2">Assignee</label>
                       <select 
                         className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                         value={newTaskAssignee}
                         onChange={(e) => setNewTaskAssignee(e.target.value)}
                       >
                           <option value="">Unassigned</option>
                           {project?.members?.map(member => (
                             <option key={member._id} value={member._id}>
                               {member.fullName}
                             </option>
                           ))}
                       </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                   <button type="button" onClick={() => setShowTaskModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                     Cancel
                   </button>
                   <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition">
                     Create
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ================= COMPLETE PROJECT CONFIRMATION MODAL ================= */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-orange-50 border-b border-orange-100 p-5 flex items-start space-x-4">
              <div className="bg-orange-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Complete project?</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  You're about to complete the project <strong>{project.name}</strong>. This action will:
                </p>
                <ul className="list-disc ml-4 mt-2 text-sm text-slate-600 space-y-1">
                  <li>Prevent new tasks from being created.</li>
                  <li>Lock the project status permanently.</li>
                </ul>
              </div>
            </div>
            <div className="p-5 bg-white flex justify-end space-x-3">
              <button onClick={() => setShowCompleteConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={() => executeStatusUpdate('Completed')} className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition">
                Complete project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}