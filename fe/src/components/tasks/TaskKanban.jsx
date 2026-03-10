// fe/src/components/tasks/TaskKanban.jsx
import { useState, useEffect } from 'react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { updateTaskApi } from '../../api/taskApi';

export default function TaskKanban({ tasks, onOpenTask, onRefresh }) {
  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

  const [localTasks, setLocalTasks] = useState(tasks);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // States quản lý Kanban & Column Limits
  const [boardColumns, setBoardColumns] = useState(() => {
    const savedCols = localStorage.getItem('kanban_columns');
    return savedCols ? JSON.parse(savedCols) : ['To Do', 'In Progress', 'In Review', 'Done'];
  });

  const [columnLimits, setColumnLimits] = useState(() => {
    const savedLimits = localStorage.getItem('kanban_limits');
    return savedLimits ? JSON.parse(savedLimits) : {};
  });

  // Lưu vào Local Storage mỗi khi có sự thay đổi
  useEffect(() => {
    localStorage.setItem('kanban_columns', JSON.stringify(boardColumns));
  }, [boardColumns]);

  useEffect(() => {
    localStorage.setItem('kanban_limits', JSON.stringify(columnLimits));
  }, [columnLimits]);
  const [activeMenu, setActiveMenu] = useState(null);

  // States quản lý Modal Jira-style
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedColForLimit, setSelectedColForLimit] = useState(null);
  const [limitInput, setLimitInput] = useState('');

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return "No date";
    const days = differenceInDays(new Date(dueDate), new Date());
    return days >= 0 ? `${days} Days` : "Overdue";
  };

  // --- DRAG & DROP ---
  const handleDragStart = (e, taskId) => setDraggingTaskId(taskId);
  const handleDragOver = (e, col) => { e.preventDefault(); setDragOverColumn(col); };
  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggingTaskId) return;

    const task = localTasks.find(t => t._id === draggingTaskId);
    if (!task || task.status === targetStatus) return;

    const previousTasks = [...localTasks];
    setLocalTasks(localTasks.map(t =>
      t._id === draggingTaskId ? { ...t, status: targetStatus } : t
    ));

    try {
      await updateTaskApi(draggingTaskId, { status: targetStatus });
      onRefresh();
    } catch (error) {
      setLocalTasks(previousTasks);
      alert("Lỗi khi chuyển trạng thái. Vui lòng thử lại.");
    } finally {
      setDraggingTaskId(null);
    }
  };

  // --- MENU 3 CHẤM & LIMIT COLUMN ---
  const moveColumn = (index, direction) => {
    const newCols = [...boardColumns];
    if (direction === 'left' && index > 0) {
      [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
    } else if (direction === 'right' && index < newCols.length - 1) {
      [newCols[index + 1], newCols[index]] = [newCols[index], newCols[index + 1]];
    }
    setBoardColumns(newCols);
    setActiveMenu(null);
  };

  // Mở Modal thay vì Alert
  const openLimitModal = (col) => {
    setSelectedColForLimit(col);
    setLimitInput(columnLimits[col] || ''); // Đổ dữ liệu cũ vào input nếu có
    setIsLimitModalOpen(true);
    setActiveMenu(null); // Đóng menu
  };

  // Hàm Lưu Limit
  const saveLimit = () => {
    const num = parseInt(limitInput, 10);
    setColumnLimits(prev => ({
      ...prev,
      [selectedColForLimit]: isNaN(num) || num <= 0 ? null : num // Xóa nếu rỗng hoặc <= 0
    }));
    setIsLimitModalOpen(false); // Đóng modal
  };

  return (
    <div className="relative flex gap-6 overflow-x-auto pb-6 h-full items-start">
      {boardColumns.map((col, index) => {
        const columnTasks = localTasks.filter(t => t.status === col);
        const isDragOver = dragOverColumn === col;

        const limit = columnLimits[col];
        const isOverLimit = limit && columnTasks.length > limit;

        return (
          <div
            key={col}
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`w-[340px] min-w-[340px] flex flex-col rounded-xl shadow-sm border p-4 h-full transition-colors duration-200 
              ${isDragOver ? "border-blue-400 bg-blue-50/50" : "bg-white border-slate-200"}
              ${isOverLimit && !isDragOver ? "bg-red-50/30 border-red-200" : ""} 
            `}
          >
            {/* Header Cột */}
            <div className="flex justify-between items-center mb-4 relative">
              <h3 className="font-bold text-slate-700 text-[15px] flex items-center">
                {col === 'Backlog' ? 'Backlog SubTasks' : col}
                
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${isOverLimit ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                  {columnTasks.length} {limit ? `/ ${limit}` : ''}
                </span>
              </h3>

              {/* Nút 3 chấm */}
              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === col ? null : col);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                </button>

                {/* Dropdown Menu Jira-style */}
                {activeMenu === col && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute right-0 top-8 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-lg py-1 z-20"
                  >
                    {index > 0 && (
                      <button onClick={() => moveColumn(index, 'left')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> Move Left
                      </button>
                    )}
                    {index < boardColumns.length - 1 && (
                      <button onClick={() => moveColumn(index, 'right')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg> Move Right
                      </button>
                    )}
                    {(index > 0 || index < boardColumns.length - 1) && <div className="border-t border-slate-100 my-1"></div>}
                    
                    {/* NÚT MỞ MODAL SET LIMIT */}
                    <button onClick={() => openLimitModal(col)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                      Set Column Limit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách thẻ Task */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              {columnTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => onOpenTask(task)}
                  className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing ${draggingTaskId === task._id ? "opacity-50 border-blue-400 scale-95" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-2">
                      <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-1">{task.title}</h4>
                      {task.project && (
                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded uppercase">{task.project.name}</div>
                      )}
                    </div>
                    <span className="flex-shrink-0 flex items-center text-xs text-slate-400 font-medium mt-1">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {getDaysLeft(task.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-3 text-slate-400 text-xs font-semibold">
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

      {/* ================= MODAL JIRA-STYLE CHO SET LIMIT ================= */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Column limit</h2>
              <p className="text-sm text-slate-600 mb-6">
                We'll highlight this column if the number of work items in it passes this limit.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Maximum work items</label>
                <input 
                  type="number" 
                  min="0"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveLimit()} // Bấm Enter để lưu
                  placeholder="Không giới hạn"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 hover:bg-slate-50 transition"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setIsLimitModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition"
                >
                  Hủy
                </button>
                <button 
                  onClick={saveLimit}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0052CC] hover:bg-[#0047b3] rounded-md transition shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}