// fe/src/components/tasks/TaskModal.jsx
import { useState, useEffect } from "react";
// SỬA: Import thêm hàm addTaskCommentApi
import { toggleTaskTimerApi, addTaskCommentApi, createTaskApi } from "../../api/taskApi";
import SubtaskList from "./SubtaskList";

export default function TaskModal({ task, allTasks = [], onClose, onRefresh }) {
  const [commentText, setCommentText] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState(""); // State cho input subtask
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const subtasks = allTasks.filter(t => t.parentTask === task._id);
  const completedSubtasks = subtasks.filter(t => t.status === "Completed").length;
  const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // Timer states
  const [localTimeSpent, setLocalTimeSpent] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let initialTime = task.timeSpent || 0;
    if (task.isRunning && task.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(task.timerStartedAt).getTime()) / 1000);
      initialTime += Math.max(0, elapsed);
    }
    setLocalTimeSpent(initialTime);
    setIsRunning(task.isRunning);
  }, [task.timeSpent, task.isRunning, task.timerStartedAt]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setLocalTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handlePlayPause = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const previousState = isRunning;
    setIsRunning(!previousState);

    try {
      await toggleTaskTimerApi(task._id);
      await onRefresh();
    } catch (error) {
      console.error("Timer update error:", error);
      setIsRunning(previousState);
      alert("Không thể cập nhật timer. Hãy thử kiểm tra lại Backend Routes.");
    } finally {
      setIsToggling(false);
    }
  };

  // SỬA LẠI HÀM SUBMIT COMMENT
  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addTaskCommentApi(task._id, commentText);
      setCommentText(""); // Xóa text trong ô input sau khi gửi
      await onRefresh(); // Fetch lại data để UI hiện comment mới
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      alert("Không thể gửi bình luận lúc này.");
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    setIsAddingSubtask(true);
    
    try {
      // Vì populate có thể biến project thành Object, ta cần lấy _id an toàn
      const projectId = task.project?._id || task.project;
      
      await createTaskApi({
        title: subtaskTitle,
        projectId: projectId,
        parentTask: task._id, // Gắn ID của task cha vào
        status: "To Do"
      });
      
      setSubtaskTitle("");
      await onRefresh(); // Lấy data mới
    } catch (error) {
      console.error("Lỗi tạo subtask", error);
      alert("Không thể tạo công việc con.");
    } finally {
      setIsAddingSubtask(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="text-sm font-semibold text-slate-500">
            {task.project?.name || "Project"}
            <span className="text-slate-300 mx-2">/</span>
            Task ID-{task._id.slice(-4).toUpperCase()}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          {/* TITLE + TIMER */}
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-bold text-slate-800 leading-tight w-2/3">{task.title}</h2>
            <div className="flex items-center space-x-3 bg-emerald-50 pl-4 pr-1.5 py-1.5 rounded-full border border-emerald-100">
              <span className="text-emerald-700 font-bold tracking-wider">{formatTime(localTimeSpent)}</span>
              <button
                onClick={handlePlayPause}
                disabled={isToggling}
                className={`p-2 rounded-full transition shadow-sm ${isRunning ? "bg-orange-200 text-orange-700 hover:bg-orange-300" : "bg-emerald-200 text-emerald-700 hover:bg-emerald-300"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isRunning ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                  Subtasks
                </h3>
                <p className="text-xs text-slate-500 mt-1">{completedSubtasks} / {subtasks.length} completed</p>
              </div>
              
              {/* Thanh tiến trình (Progress Bar) */}
              <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            {/* List */}
            <SubtaskList subtasks={subtasks} onRefresh={onRefresh} />

            {/* Form Thêm mới */}
            <form onSubmit={handleAddSubtask} className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add new subtask..."
                className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isAddingSubtask}
              />
              <button 
                type="submit" 
                disabled={!subtaskTitle.trim() || isAddingSubtask}
                className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition"
              >
                Add
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 pt-8 mt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Activity & Comments ({task.comments?.length || 0})</h3>
            
            {/* DANH SÁCH COMMENT CŨ */}
            <div className="space-y-5 mb-8">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment, index) => (
                  <div key={index} className="flex space-x-4">
                    <img 
                      src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.fullName || 'U'}`} 
                      className="w-10 h-10 rounded-full border border-slate-200" 
                      alt="avatar" 
                    />
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-slate-800">{comment.user?.fullName || "Unknown User"}</span>
                        <span className="text-xs font-medium text-slate-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 italic">Chưa có bình luận nào.</div>
              )}
            </div>

            {/* FORM NHẬP COMMENT MỚI */}
            <form onSubmit={submitComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn vào đây..."
                className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                rows="3"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Comment
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}