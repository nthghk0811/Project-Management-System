// fe/src/components/tasks/TaskKanban.jsx
import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { updateTaskApi } from "../../api/taskApi";

export default function TaskKanban({ tasks, onOpenTask, onRefresh }) {

  const [localTasks, setLocalTasks] = useState(tasks);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const [boardColumns, setBoardColumns] = useState(() => {
    const savedCols = localStorage.getItem("kanban_columns");
    return savedCols ? JSON.parse(savedCols) : ["To Do", "In Progress", "In Review", "Done"];
  });

  const [columnLimits, setColumnLimits] = useState(() => {
    const savedLimits = localStorage.getItem("kanban_limits");
    return savedLimits ? JSON.parse(savedLimits) : {};
  });

  const [activeMenu, setActiveMenu] = useState(null);

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedColForLimit, setSelectedColForLimit] = useState(null);
  const [limitInput, setLimitInput] = useState("");

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("kanban_columns", JSON.stringify(boardColumns));
  }, [boardColumns]);

  useEffect(() => {
    localStorage.setItem("kanban_limits", JSON.stringify(columnLimits));
  }, [columnLimits]);

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

  // ================= DRAG DROP =================
  const handleDragStart = (e, taskId) => {
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    setDragOverColumn(col);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggingTaskId) return;

    const task = localTasks.find((t) => t._id === draggingTaskId);
    if (!task || task.status === targetStatus) return;

    const previousTasks = [...localTasks];

    setLocalTasks(
      localTasks.map((t) =>
        t._id === draggingTaskId ? { ...t, status: targetStatus } : t
      )
    );

    try {
      await updateTaskApi(draggingTaskId, { status: targetStatus });
      onRefresh();
    } catch (error) {
      setLocalTasks(previousTasks);
      alert("Lỗi khi chuyển trạng thái");
    } finally {
      setDraggingTaskId(null);
    }
  };

  // ================= PRIORITY CHANGE =================
  const handlePriorityChange = async (e, taskId) => {
    e.stopPropagation();
    const newPriority = e.target.value;

    try {
      await updateTaskApi(taskId, { priority: newPriority });
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật độ ưu tiên");
    }
  };

  // ================= MOVE COLUMN =================
  const moveColumn = (index, direction) => {
    const newCols = [...boardColumns];

    if (direction === "left" && index > 0) {
      [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
    } else if (direction === "right" && index < boardColumns.length - 1) {
      [newCols[index + 1], newCols[index]] = [newCols[index], newCols[index + 1]];
    }

    setBoardColumns(newCols);
    setActiveMenu(null);
  };

  const openLimitModal = (col) => {
    setSelectedColForLimit(col);
    setLimitInput(columnLimits[col] || "");
    setIsLimitModalOpen(true);
    setActiveMenu(null);
  };

  const saveLimit = () => {
    const num = parseInt(limitInput, 10);

    setColumnLimits((prev) => ({
      ...prev,
      [selectedColForLimit]: isNaN(num) || num <= 0 ? null : num,
    }));

    setIsLimitModalOpen(false);
  };

  return (
    <div className="relative flex gap-6 overflow-x-auto pb-6 h-full items-start">
      {boardColumns.map((col, index) => {

        const columnTasks = localTasks.filter((t) => t.status === col);
        const isDragOver = dragOverColumn === col;

        const limit = columnLimits[col];
        const isOverLimit = limit && columnTasks.length > limit;

        return (
          <div
            key={col}
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`w-[340px] min-w-[340px] flex flex-col rounded-xl shadow-sm border p-4 h-full transition
            ${isDragOver ? "border-blue-400 bg-blue-50/50" : "bg-white border-slate-200"}
            ${isOverLimit && !isDragOver ? "bg-red-50/30 border-red-200" : ""}`}
          >
            {/* COLUMN HEADER */}
            <div className="flex justify-between items-center mb-4 relative">

              <h3 className="font-bold text-slate-700 text-[15px] flex items-center">
                {col}

                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isOverLimit
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {columnTasks.length} {limit ? `/ ${limit}` : ""}
                </span>
              </h3>

              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === col ? null : col);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                >
                  ⋯
                </button>

                {activeMenu === col && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-8 w-48 bg-white border shadow-xl rounded-lg py-1 z-20"
                  >
                    {index > 0 && (
                      <button
                        onClick={() => moveColumn(index, "left")}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        Move Left
                      </button>
                    )}

                    {index < boardColumns.length - 1 && (
                      <button
                        onClick={() => moveColumn(index, "right")}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        Move Right
                      </button>
                    )}

                    <button
                      onClick={() => openLimitModal(col)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Set Column Limit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TASK LIST */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              {columnTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => onOpenTask(task)}
                  className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-grab
                  ${
                    draggingTaskId === task._id
                      ? "opacity-50 border-blue-400 scale-95"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-2">
                      <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-1">
                        {task.title}
                      </h4>

                      {task.project && (
                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-block px-1.5 py-0.5 rounded uppercase">
                          {task.project.name}
                        </div>
                      )}
                    </div>

                    <span className="text-xs text-slate-400">
                      {getDaysLeft(task.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">

                    <div className="flex items-center">

                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handlePriorityChange(e, task._id)}
                        value={task.priority || "medium"}
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] cursor-pointer border mr-2
                        ${
                          task.priority === "high"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : task.priority === "low"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-orange-50 text-orange-600 border-orange-200"
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Med</option>
                        <option value="high">High</option>
                      </select>

                      <div className="text-slate-400 text-xs font-semibold mr-3">
                        {task.comments?.length || 0}
                      </div>

                      <div className="text-slate-400 text-xs font-semibold">
                        {localTasks.filter((t) => t.parentTask === task._id).length}
                      </div>
                    </div>

                    <div className="flex -space-x-2">
                      <img
                        className="w-6 h-6 rounded-full border-2 border-white"
                        src={
                          task.owner?.avatar ||
                          `https://ui-avatars.com/api/?name=${task.owner?.fullName || "O"}`
                        }
                      />

                      {task.assignee && (
                        <img
                          className="w-6 h-6 rounded-full border-2 border-white"
                          src={
                            task.assignee?.avatar ||
                            `https://ui-avatars.com/api/?name=${task.assignee?.fullName || "A"}`
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* LIMIT MODAL */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[480px] p-6">

            <h2 className="text-xl font-bold mb-4">Column limit</h2>

            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Không giới hạn"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsLimitModalOpen(false)}
                className="px-4 py-2 text-sm"
              >
                Hủy
              </button>

              <button
                onClick={saveLimit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}