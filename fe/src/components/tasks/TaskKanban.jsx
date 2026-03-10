// fe/src/components/tasks/TaskKanban.jsx
import { useState, useEffect } from 'react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { updateTaskApi } from '../../api/taskApi'; // Import API update task

export default function TaskKanban({ tasks, onOpenTask, onRefresh }) {
  // LƯU Ý: Nếu Backend báo lỗi 500 khi thả, hãy kiểm tra lại enum status trong model Task. 
  // Model cũ của bạn là ["To Do", "In Progress", "In Review", "Done"]. 
  // Bạn có thể cần sửa columns UI thành các giá trị khớp với DB hoặc sửa DB để nhận mảng này.
  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

  // State cục bộ để tạo cảm giác kéo thả mượt mà (không bị khựng chờ mạng)
  const [localTasks, setLocalTasks] = useState(tasks);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Đồng bộ localTasks mỗi khi tasks từ parent truyền xuống thay đổi
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return "No date";
    const days = differenceInDays(new Date(dueDate), new Date());
    return days >= 0 ? `${days} Days` : "Overdue";
  };

  // --- CÁC HÀM XỬ LÝ KÉO THẢ (DRAG & DROP) ---

  const handleDragStart = (e, taskId) => {
    setDraggingTaskId(taskId);
    // e.dataTransfer.effectAllowed = "move"; // Tùy chọn để đổi icon con trỏ chuột
  };

  const handleDragOver = (e, col) => {
    e.preventDefault(); // Rất quan trọng: Bắt buộc phải có để cho phép thả (drop)
    setDragOverColumn(col);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggingTaskId) return;

    const task = localTasks.find(t => t._id === draggingTaskId);
    if (!task || task.status === targetStatus) return; // Nếu thả đúng cột cũ thì bỏ qua

    // 1. Cập nhật UI ngay lập tức (Optimistic UI)
    const previousTasks = [...localTasks];
    setLocalTasks(localTasks.map(t =>
      t._id === draggingTaskId ? { ...t, status: targetStatus } : t
    ));

    // 2. Gọi API ngầm để lưu vào DB
    try {
      await updateTaskApi(draggingTaskId, { status: targetStatus });
      onRefresh(); // Báo cho parent biết để sync lại data gốc nếu cần
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái Task:", error);
      // Nếu API lỗi, trả thẻ về chỗ cũ
      setLocalTasks(previousTasks);
      alert("Lỗi khi chuyển trạng thái. Vui lòng thử lại.");
    } finally {
      setDraggingTaskId(null);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full items-start">
      {columns.map(col => {
        const columnTasks = localTasks.filter(t => t.status === col);
        const isDragOver = dragOverColumn === col;

        return (
          <div
            key={col}
            // Vùng DropZone
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`w-[340px] min-w-[340px] flex flex-col bg-white rounded-xl shadow-sm border p-4 h-full transition-colors duration-200 ${isDragOver ? "border-blue-400 bg-blue-50/50" : "border-slate-200"
              }`}
          >
            {/* Header Cột */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 text-[15px] flex items-center">
                {col === 'Backlog' ? 'Backlog SubTasks' : col}
                <span className="ml-2 text-slate-400 font-normal text-sm">{columnTasks.length}</span>
              </h3>
              <button className="text-slate-400 hover:text-slate-800 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
              </button>
            </div>

            <button className="w-full border-2 border-dashed border-teal-500/40 text-teal-600 rounded-lg py-2 mb-4 flex items-center justify-center hover:bg-teal-50 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>

            {/* Danh sách thẻ Task */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              {columnTasks.map(task => (
                <div
                  key={task._id}
                  draggable // Bật tính năng cho phép cầm kéo
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => onOpenTask(task)}
                  className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing ${draggingTaskId === task._id ? "opacity-50 border-blue-400 scale-95" : ""
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-2">
                      <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-1">{task.title}</h4>
                      {task.project && (
                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded uppercase">
                          {task.project.name}
                        </div>
                      )}
                    </div>
                    <span className="flex-shrink-0 flex items-center text-xs text-slate-400 font-medium mt-1">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {getDaysLeft(task.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-3 text-slate-400 text-xs font-semibold">
                      {/* <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        {task.attachments?.length || 0}
                      </div> */}
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        {task.comments?.length || 0}
                      </div>

                      <div className="flex items-center" title="Subtasks">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                        {localTasks.filter(t => t.parentTask === task._id).length}
                      </div>
                    </div>

                    <div className="flex -space-x-2">
                      <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src={task.owner?.avatar || `https://ui-avatars.com/api/?name=${task.owner?.fullName || 'O'}`} alt="Owner" />
                      {task.assignee && (
                        <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.fullName || 'A'}`} alt="Assignee" />
                      )}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">+</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}